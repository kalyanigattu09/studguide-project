// STUGUIDE X - Auth Controller
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Profile = require('../models/Profile');
const hybridDb = require('../config/hybridDb');
const { sessionCache } = require('../services/hashMap');

// Helper to sign JWT token
const getSignedToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'stuguide_secret_jwt_2030', {
    expiresIn: '24h'
  });
};

const createPlainToken = () => crypto.randomBytes(24).toString('hex');

// Send response helper
const sendTokenResponse = (user, statusCode, res) => {
  const token = getSignedToken(user._id);

  const options = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    httpOnly: true
  };

  // Cache user session in custom SessionHashMap (data structure)
  sessionCache.set(token, { id: user._id, role: user.role, email: user.email }, 24 * 60 * 60 * 1000);

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};

// @desc    Register User
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const emailVerificationToken = createPlainToken();

    let user;
    if (hybridDb.isActive) {
      const exists = hybridDb.findOne('users', { email });
      if (exists) {
        return res.status(400).json({ success: false, error: 'User already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user = hybridDb.insert('users', {
        name,
        email,
        password: hashedPassword,
        role: role || 'Student',
        isEmailVerified: false,
        emailVerificationToken
      });
    } else {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ success: false, error: 'User already exists' });
      }
      user = await User.create({ name, email, password, role, emailVerificationToken });
    }

    const token = getSignedToken(user._id);
    sessionCache.set(token, { id: user._id, role: user.role, email: user.email }, 24 * 60 * 60 * 1000);

    res.status(201).cookie('token', token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true
    }).json({
      success: true,
      token,
      devVerificationToken: emailVerificationToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified || false
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    let user;
    let isMatch = false;

    if (hybridDb.isActive) {
      user = hybridDb.findOne('users', { email });
      if (user) {
        isMatch = await bcrypt.compare(password, user.password);
      }
    } else {
      user = await User.findOne({ email }).select('+password');
      if (user) {
        isMatch = await user.matchPassword(password);
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Logout User
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // Delete session from custom HashMap cache
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (token) {
      sessionCache.delete(token);
    }

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Current Logged In User
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // Session lookups could optionally check the SessionHashMap cache first
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Request password reset token
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const resetToken = createPlainToken();
    const resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000);
    let user;

    if (hybridDb.isActive) {
      user = hybridDb.findOne('users', { email });
      if (user) {
        hybridDb.update('users', { _id: user._id }, { resetPasswordToken: resetToken, resetPasswordExpire: resetPasswordExpire.toISOString() });
      }
    } else {
      user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpire');
      if (user) {
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = resetPasswordExpire;
        await user.save({ validateBeforeSave: false });
      }
    }

    res.status(200).json({
      success: true,
      message: 'If the account exists, a password reset token has been generated.',
      devResetToken: user ? resetToken : null
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password by token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    let user;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    if (hybridDb.isActive) {
      user = hybridDb.findOne('users', { resetPasswordToken: token });
      if (!user || new Date(user.resetPasswordExpire) < new Date()) {
        return res.status(400).json({ success: false, error: 'Invalid or expired reset token.' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      hybridDb.update('users', { _id: user._id }, {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpire: undefined
      });
      user = hybridDb.findOne('users', { _id: user._id });
    } else {
      user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() }
      }).select('+password +resetPasswordToken +resetPasswordExpire');
      if (!user) {
        return res.status(400).json({ success: false, error: 'Invalid or expired reset token.' });
      }
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Verify email by token
// @route   PUT /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    let user;

    if (hybridDb.isActive) {
      user = hybridDb.findOne('users', { emailVerificationToken: token });
      if (!user) return res.status(400).json({ success: false, error: 'Invalid verification token.' });
      hybridDb.update('users', { _id: user._id }, { isEmailVerified: true, emailVerificationToken: undefined });
      user = hybridDb.findOne('users', { _id: user._id });
    } else {
      user = await User.findOne({ emailVerificationToken: token }).select('+emailVerificationToken');
      if (!user) return res.status(400).json({ success: false, error: 'Invalid verification token.' });
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save({ validateBeforeSave: false });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};
