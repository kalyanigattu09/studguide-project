// STUGUIDE X - Mock Test & Question Models
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: [arr => arr.length >= 2, 'At least 2 options are required']
  },
  correctIndex: {
    type: Number,
    required: true
  },
  explanation: String,
  category: {
    type: String,
    required: true
  }
});

const MockTestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Aptitude', 'Reasoning', 'Verbal', 'Java', 'Python', 'JavaScript', 
      'React', 'Node.js', 'DBMS', 'Operating Systems', 'Computer Networks', 'DSA'
    ]
  },
  durationMinutes: {
    type: Number,
    required: true
  },
  questions: [QuestionSchema],
  totalMarks: {
    type: Number,
    default: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = {
  MockTest: mongoose.model('MockTest', MockTestSchema),
  Question: mongoose.model('Question', QuestionSchema)
};
