// STUGUIDE X - Study Resource Model
const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Note', 'PDF', 'Video', 'Link'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  bookmarkedBy: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resource', ResourceSchema);
