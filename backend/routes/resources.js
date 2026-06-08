// STUGUIDE X - Resource Hub Routes
const express = require('express');
const { getResources, createResource, toggleBookmark } = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getResources)
  .post(protect, authorize('Faculty', 'PlacementOfficer', 'Admin'), createResource);

router.put('/:id/bookmark', protect, toggleBookmark);

module.exports = router;
