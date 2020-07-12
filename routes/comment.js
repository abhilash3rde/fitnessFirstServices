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

//TODO: revisit
router.delete('/:postId/:commentId', async function (req, res, next) {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req;

    const post = await Posts.removeComment(postId, commentId);

    await Comment.remove(
      commentId,
      userId
    );
    if(!post){
      throw Error ("Error deleting comment"); 
    }

    res.json({ post });
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
      contentId: commentId,
      contentType: 'COMMENT'
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

    const result = await Like.unlike(commentId);

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

router.put('/:commentId/reportSpam', async function (req, res, next) {
  try {
    const { commentId } = req.params;
    const result = await Comment.edit(commentId, {spam: true});

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


//Admin only
router.put('/:commentId/removeSpam', async function (req, res, next) {
  try {
    const { commentId } = req.params;
    const result = await Comment.edit(commentId, {spam: false});

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

//Admin only
router.put('/:commentId/approve', async function (req, res, next) {
  try {
    const { userId } = req;
    const { commentId } = req.params;

    const result = await Comment.edit(
     commentId, {approved : true});
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


router.get('/getForPost/:postId/:page', async function (req, res, next) {
  try {

    const {postId, page} = req.params;

    let comments = [];
    let nextPage = null;
    const records = await Comment.getForPosts({page}, postId);
    if (records.docs.length > 0) {
      comments = [...records.docs];
      if (records.page < records.pages) {
        nextPage = "/comment/getForPost/"+postId+"/"+(parseInt(records.page) + 1);
      }
    }
    res.json({ comments, nextPage });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;
