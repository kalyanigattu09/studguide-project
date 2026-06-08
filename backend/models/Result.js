// STUGUIDE X - Test Result Model
const mongoose = require('mongoose');

const TopicScoreSchema = new mongoose.Schema({
  topicName: String,
  correctCount: Number,
  totalCount: Number
});

const ResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  mockTest: {
    type: mongoose.Schema.ObjectId,
    ref: 'MockTest',
    required: true
  },
  testTitle: String,
  category: String,
  marksObtained: {
    type: Number,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  scorePercent: {
    type: Number,
    required: true
  },
  timeSpentSeconds: Number,
  topicBreakdown: [TopicScoreSchema],
  weakTopics: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Result', ResultSchema);
