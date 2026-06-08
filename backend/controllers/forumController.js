// STUGUIDE X - Forum Discussions Controller
const ForumPost = require('../models/ForumPost');
const Comment = require('../models/Comment');
const hybridDb = require('../config/hybridDb');

// @desc    Get All Forum Posts
// @route   GET /api/forum
// @access  Private
exports.getPosts = async (req, res, next) => {
  try {
    let posts;
    if (hybridDb.isActive) {
      posts = hybridDb.find('forumposts');
    } else {
      posts = await ForumPost.find().sort('-createdAt');
    }
    res.status(200).json({ success: true, count: posts.length, data: posts });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Single Post with Comments
// @route   GET /api/forum/:id
// @access  Private
exports.getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let post;
    let comments;

    if (hybridDb.isActive) {
      post = hybridDb.findOne('forumposts', { _id: id });
      comments = hybridDb.find('comments', { post: id });
    } else {
      post = await ForumPost.findById(id);
      comments = await Comment.find({ post: id }).sort('createdAt');
    }

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.status(200).json({ success: true, data: { post, comments } });
  } catch (err) {
    next(err);
  }
};

// @desc    Create Forum Post
// @route   POST /api/forum
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    const postPayload = {
      author: req.user._id,
      authorName: req.user.name,
      title,
      content,
      tags: tags || [],
      likes: [],
      commentsCount: 0
    };

    let post;
    if (hybridDb.isActive) {
      post = hybridDb.insert('forumposts', postPayload);
    } else {
      post = await ForumPost.create(postPayload);
    }

    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// @desc    Comment on a Post
// @route   POST /api/forum/:id/comment
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;

    let post;
    if (hybridDb.isActive) {
      post = hybridDb.findOne('forumposts', { _id: postId });
    } else {
      post = await ForumPost.findById(postId);
    }

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const commentPayload = {
      post: postId,
      author: req.user._id,
      authorName: req.user.name,
      content,
      likes: []
    };

    let comment;
    if (hybridDb.isActive) {
      comment = hybridDb.insert('comments', commentPayload);
      const comments = hybridDb.find('comments', { post: postId });
      hybridDb.update('forumposts', { _id: postId }, { commentsCount: comments.length });
    } else {
      comment = await Comment.create(commentPayload);
      post.commentsCount += 1;
      await post.save();
    }

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
};

// @desc    Like a Forum Post
// @route   PUT /api/forum/:id/like
// @access  Private
exports.likePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    let post;

    if (hybridDb.isActive) {
      post = hybridDb.findOne('forumposts', { _id: postId });
      if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

      let likes = post.likes || [];
      if (likes.includes(req.user._id)) {
        // Unlike
        likes = likes.filter(id => id !== req.user._id);
      } else {
        // Like
        likes.push(req.user._id);
      }
      hybridDb.update('forumposts', { _id: postId }, { likes });
      post = hybridDb.findOne('forumposts', { _id: postId });
    } else {
      post = await ForumPost.findById(postId);
      if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

      const idx = post.likes.indexOf(req.user._id);
      if (idx > -1) {
        post.likes.splice(idx, 1); // unlike
      } else {
        post.likes.push(req.user._id); // like
      }
      await post.save();
    }

    res.status(200).json({ success: true, likesCount: post.likes.length, likes: post.likes });
  } catch (err) {
    next(err);
  }
};
