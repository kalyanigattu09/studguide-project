// STUGUIDE X - Habit Streaks Model
const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a habit name'],
    trim: true
  },
  streakCount: {
    type: Number,
    default: 0
  },
  history: {
    type: [String], // Array of 'YYYY-MM-DD' dates when completed
    default: []
  },
  lastCompleted: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Habit', HabitSchema);
