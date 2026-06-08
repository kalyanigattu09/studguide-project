// STUGUIDE X - Authentication & Role Authorization Middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const hybridDb = require('../config/hybridDb');

exports.protect = async (req, res, next) => {
  let token;

  // Support token inside headers or cookie parsers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'stuguide_secret_jwt_2030');
    
    if (hybridDb.isActive) {
      const user = hybridDb.findOne('users', { _id: decoded.id });
      if (!user) {
        return res.status(401).json({ success: false, error: 'User does not exist in HybridDB.' });
      }
      req.user = user;
    } else {
      req.user = await User.findById(decoded.id);
    }

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication failed. User not found.' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired authorization token.' });
  }
};

// Role limits authorization mapper
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access forbidden. Role '${req.user.role}' is unauthorized to perform this action.`
      });
    }
    next();
  };
};
