const express = require('express');
const router = express.Router();

const Posts = require('../models/post');
const Like = require('../models/like');
const Comment = require('../models/comment');

router.post('/:postId', async function (req, res, next) {
  try {
    const { postId } = req.params;
    const { userId } = req;
    const { commentText } = req.body;

    const comment = await Comment.create({
      postId,
      commentedBy : userId,
      commentText
    });
    if (!comment) throw new Error("Failed to create comment");

    const post = await Posts.addComment(postId, comment._id);
    if (!post) throw new Error("Failed to add comment to post");

    res.json({ comment });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/:commentId', async function (req, res, next) {
  try {
    const { commentId } = req.params;
    const { userId } = req;
    const { commentText } = req.body;
    const comment = await Comment.edit(
      commentId,
      userId,
      commentText
    );
    if (!comment) throw new Error("Failed to edit comment");

    res.json({ comment });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.delete('/:commentId', async function (req, res, next) {
  try {
    const { commentId } = req.params;
    const { userId } = req;
    const postId = await Comment.remove(
      commentId,
      userId
    );
    if (postId) {
      const post = await Posts.removeComment(postId, commentId);
      if (!post) throw new Error("Error deleting Comment");
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.post('/:commentId/like', async function (req, res, next) {
  try {
    const { userId } = req;
    const { commentId } = req.params;

    const result = await Like.create({
      likedBy : userId,
      commentId
    })
    if (result)
      res.json({
        success: true
      });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.post('/:commentId/unlike', async function (req, res, next) {
  try {
    const { commentId } = req.params;

    const result = await Like.unlikeComment(commentId);

    if (result)
      res.json({
        success: true
      });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;
