// STUGUIDE X - Reminder Model
const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Study Session', 'Placement Drive', 'Assignment', 'Interview', 'Mock Test'],
    required: true
  },
  datetime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Sent'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reminder', ReminderSchema);
