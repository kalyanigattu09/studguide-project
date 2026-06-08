// STUGUIDE X - Admin Routes
const express = require('express');
const { getStats, exportReport } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', protect, authorize('PlacementOfficer', 'Admin'), getStats);
router.get('/reports/:type', protect, authorize('PlacementOfficer', 'Admin'), exportReport);

module.exports = router;
