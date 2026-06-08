// STUGUIDE X - Mock Test & Leaderboard Routes
const express = require('express');
const { getMockTests, getMockTestById, submitMockTest, getLeaderboard } = require('../controllers/mockTestController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/leaderboard', protect, getLeaderboard);

router.route('/')
  .get(protect, getMockTests);

router.route('/:id')
  .get(protect, getMockTestById);

router.route('/:id/submit')
  .post(protect, submitMockTest);

module.exports = router;
