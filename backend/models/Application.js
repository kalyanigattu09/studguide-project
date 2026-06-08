// STUGUIDE X - Job Application Model
const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  drive: {
    type: mongoose.Schema.ObjectId,
    ref: 'PlacementDrive',
    required: true
  },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'],
    default: 'Applied'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  remarks: String
});

module.exports = mongoose.model('Application', ApplicationSchema);
