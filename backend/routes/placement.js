// STUGUIDE X - Placement Routes
const express = require('express');
const { 
  addCompany, 
  getCompanies, 
  createDrive, 
  getDrives, 
  applyToDrive, 
  getMyApplications, 
  getPlacementAnalytics,
  getDriveApplicants,
  updateApplicationStatus
} = require('../controllers/placementController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/analytics', protect, getPlacementAnalytics);
router.get('/my-applications', protect, getMyApplications);
router.get('/applications/my', protect, getMyApplications);
router.put('/applications/:id/status', protect, authorize('PlacementOfficer', 'Admin'), updateApplicationStatus);

router.route('/company')
  .post(protect, authorize('PlacementOfficer', 'Admin'), addCompany)
  .get(protect, getCompanies);

router.route('/companies')
  .post(protect, authorize('PlacementOfficer', 'Admin'), addCompany)
  .get(protect, getCompanies);

router.route('/drive')
  .post(protect, authorize('PlacementOfficer', 'Admin'), createDrive)
  .get(protect, getDrives);

router.route('/drives')
  .post(protect, authorize('PlacementOfficer', 'Admin'), createDrive)
  .get(protect, getDrives);

router.post('/drive/:id/apply', protect, applyToDrive);
router.post('/drives/:id/apply', protect, applyToDrive);
router.get('/drives/:id/applicants', protect, authorize('PlacementOfficer', 'Admin'), getDriveApplicants);

module.exports = router;
