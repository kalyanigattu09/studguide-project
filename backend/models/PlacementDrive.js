// STUGUIDE X - Placement Drive Model
const mongoose = require('mongoose');

const PlacementDriveSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  jobRole: {
    type: String,
    required: [true, 'Please add a job role']
  },
  packageLPA: {
    type: Number,
    required: [true, 'Please add package details in LPA']
  },
  eligibilityCGPA: {
    type: Number,
    default: 0
  },
  eligibleBranches: {
    type: [String],
    default: ['All']
  },
  location: String,
  deadline: {
    type: Date,
    required: true
  },
  requiredSkills: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Completed'],
    default: 'Open'
  },
  registeredStudents: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PlacementDrive', PlacementDriveSchema);
