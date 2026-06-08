// STUGUIDE X - Productivity Task Model
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Study', 'Mock', 'Code', 'Revision', 'Daily', 'Weekly', 'Monthly'],
    default: 'Study'
  },
  status: {
    type: String,
    enum: ['Todo', 'InProgress', 'Done'],
    default: 'Todo'
  },
  date: {
    type: String, // 'YYYY-MM-DD'
    required: true
  },
  timeBlock: {
    type: String, // e.g. '09:00 - 10:30' or 'Evening'
    default: 'General'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', TaskSchema);
