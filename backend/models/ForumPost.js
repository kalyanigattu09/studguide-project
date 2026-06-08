// STUGUIDE X - Forum Post Model
const mongoose = require('mongoose');

const ForumPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  tags: {
    type: [String],
    default: []
  },
  likes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  commentsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ForumPost', ForumPostSchema);
