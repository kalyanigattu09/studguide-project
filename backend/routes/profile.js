// STUGUIDE X - Student Profile Routes
const express = require('express');
const { getProfile, updateProfile, analyzeResume } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getProfile)
  .post(protect, updateProfile)
  .put(protect, updateProfile);

router.get('/me', protect, getProfile);
router.post('/analyze-resume', protect, analyzeResume);

module.exports = router;
