const express = require('express');
const router = express.Router();

const Posts = require('../models/post');
const Like = require('../models/like');
const utility = require('../utility/utility');
const { saveFileToServer } = require('../config/uploadConfig');
const fs = require('fs');
var path = require('path');

router.get('/getAll/:page?', async function (req, res, next) {
  try {

    const page = req.params['page'] ? req.params['page'] : 1;

    let posts = [];
    let nextPage = null;
    const records = await Posts.list({page});
    if (records.docs.length > 0) {
      posts = [...records.docs];
      if (records.page < records.pages) {
        nextPage = "/post/getAll/"+(parseInt(records.page) + 1);
      }
    }
    res.json({ posts, nextPage });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/:postId/updateMedia', async function (req, res, next) {
  try {
    const { postId } = req.params;
    const mediaFile = req.files ? req.files.mediaContent : null;
    const content = await utility.uploadMedia(mediaFile);

    const post = await Posts.edit(
      postId, {
      ...content
    });
    if (!post) throw new Error("Post updation failed");

    res.json({ post });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/:postId/updateText', async function (req, res, next) {
  try {
    const { postId } = req.params;
    const postContent = req.body;

    const post = await Posts.edit(
      postId, {
      ...postContent
    });
    if (!post) throw new Error("Post updation failed");

    res.json({ post });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.post('/', async function (req, res, next) {
  try {
    const { userId } = req;

    const mediaFile = req.files ? req.files.mediaContent : null;

    const content = await utility.uploadMedia(mediaFile);
    const postContent = req.body;

    const post = await Posts.create(
      {
        ...content,
        createdBy: userId,
        ...postContent
      });

    if (!post) throw new Error("Post creation failed");
    res.json({ post });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.delete('/:postId', async function (req, res, next) {
  try {
    const { userId } = req;
    const { postId } = req.params;

    const result = await Posts.remove(postId, userId);
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

router.post('/:postId/like', async function (req, res, next) {
  try {
    const { userId } = req;
    const { postId } = req.params;

    const result = await Like.create({
      likedBy: userId,
      postId
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

router.post('/:postId/unlike', async function (req, res, next) {
  try {
    const { postId } = req.params;

    const result = await Like.unlikePost(postId);

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

router.get('/my/:page?', async function (req, res, next) {
  try {
    const { userId } = req;
    const page = req.params['page'] ? req.params['page'] : 1;

    let posts = [];
    let nextPage = null;

    const records = await Posts.getMy({page}, userId);
    if (records.docs.length > 0) {
      posts = [...records.docs];
      if (records.page < records.pages) {
        nextPage = "/post/my/"+(parseInt(records.page) + 1);
      }
    }
    res.json({ posts, nextPage });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;
