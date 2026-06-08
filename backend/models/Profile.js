// STUGUIDE X - Student Profile Model
const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  technologies: [String],
  link: String
});

const CertificationSchema = new mongoose.Schema({
  name: String,
  issuer: String,
  date: Date,
  link: String
});

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  rollNo: {
    type: String,
    required: [true, 'Please add a roll number'],
    unique: true
  },
  branch: {
    type: String,
    required: [true, 'Please add a branch/department']
  },
  semester: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  cgpa: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  skills: {
    type: [String],
    default: []
  },
  interests: {
    type: [String],
    default: []
  },
  projects: [ProjectSchema],
  certifications: [CertificationSchema],
  achievements: {
    type: [String],
    default: []
  },
  resume: String, // Path/URL
  gitHub: String,
  linkedIn: String,
  portfolio: String,
  
  // Scoring engines cached values
  profileCompletionScore: {
    type: Number,
    default: 0
  },
  placementReadinessScore: {
    type: Number,
    default: 0
  },
  resumeScore: {
    type: Number,
    default: 0
  },
  avgMockScore: {
    type: Number,
    default: 0
  },
  codingStreak: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', ProfileSchema);
