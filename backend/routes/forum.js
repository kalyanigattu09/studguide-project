// STUGUIDE X - Forum Routes
const express = require('express');
const { getPosts, getPostById, createPost, addComment, likePost } = require('../controllers/forumController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getPosts)
  .post(protect, createPost);

router.route('/:id')
  .get(protect, getPostById);

router.post('/:id/comment', protect, addComment);
router.put('/:id/like', protect, likePost);

module.exports = router;
