// STUGUIDE X - Career Guidance Routes
const express = require('express');
const { getCareerRoles, getRoadmap, analyzeGaps } = require('../controllers/guidanceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/roles', protect, getCareerRoles);
router.get('/roadmap/:role', protect, getRoadmap);
router.post('/gaps', protect, analyzeGaps);

module.exports = router;
