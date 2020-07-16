const express = require('express');
const router = express.Router();

const {admin} = require('../config');
const Post = require('../models/post');
const Like = require('../models/like');
const utility = require('../utility/utility');

const Comment = require('../models/comment');
const UserUtils = require('../utility/userUtils')

router.get('/getAll/:page?', async function (req, res, next) {
  try {

    const page = req.params['page'] ? req.params['page'] : 1;

    let posts = [];
    let nextPage = null;
    const records = await Post.list({page});

    if (records.docs.length > 0) {
      const postRecords = [...records.docs];

     await asyncForEach(postRecords, async post=>{
        const likes = await Like.getForContent(post._id);
        
        post.createdBy = await UserUtils.populateUser(post.createdBy._id, post.createdBy.userType);
        posts.push({...post, likes});
      });

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

    const post = await Post.edit(
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

    const post = await Post.edit(
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

    const post = await Post.create(
      {
        ...content,
        createdBy: userId,
        ...postContent
      });

    if (!post) throw new Error("Post creation failed");
    const message = {
      data: {
        type: remoteMessageTypes.UPDATE_POSTS
      },
      topic: firebaseTopics.SILENT_NOTIFICATION,
    };
    admin
      .messaging()
      .send(message)
      .then(response => {
        console.log('Successfully sent message:', response);
      })
      .catch(error => {
        console.log('Error sending message:', error);
      });

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

    const result = await Post.remove(postId, userId);
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

router.get('/:postId', async function (req, res, next) {
  try {
    const { postId } = req.params;

    const post = await Post.get(postId);
    const likes = await Like.getForContent(post._id);

    let comments = [];
    let nextPage = null;

    const records = await Comment.getForPosts({page: 1}, postId);
    if (records.docs.length > 0) {
      const commentRecords = [...records.docs];

      await asyncForEach(commentRecords, async comment=>{
        const likes = await Like.getForContent(comment._id);
        comment.commentedBy = await UserUtils.populateUser(comment.commentedBy._id, comment.commentedBy.userType);
        comments.push({...comment, likes});
      });

      if (records.page < records.pages) {
        nextPage = "/comment/getForPost/"+postId+"/"+(parseInt(records.page) + 1);
      }
    }

    if (post){
      post.createdBy = await UserUtils.populateUser(post.createdBy._id, post.createdBy.userType);
    }
    res.json({ post, likes, comments, nextPage});
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
      contentId: postId,
      contentType: 'POST'
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

    const result = await Like.unlike(postId);

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

router.get('/user/my/:page?', async function (req, res, next) {
  try {
    const { userId } = req;
    const page = req.params['page'] ? req.params['page'] : 1;

    let posts = [];
    let nextPage = null;

    const records = await Post.getMy({page}, userId);
    if (records.docs.length > 0) {
      const postRecords = [...records.docs];

      await asyncForEach(postRecords, async post=>{
        const likes = await Like.getForContent(post._id);
        post.createdBy = await UserUtils.populateUser(post.createdBy._id, post.createdBy.userType);
         posts.push({...post, likes});
      });

      if (records.page < records.pages) {
        nextPage = "/post/user/my/"+(parseInt(records.page) + 1);
      }
    }
    res.json({ posts, nextPage });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/:postId/reportSpam', async function (req, res, next) {
  try {
    const { postId } = req.params;

    const result = await Post.edit(
     postId, {spam : true});
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
router.put('/:postId/removeSpam', async function (req, res, next) {
  try {
    const { userId } = req;
    const { postId } = req.params;

    const result = await Post.edit(
     postId, {spam : false});
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
router.put('/:postId/approve', async function (req, res, next) {
  try {
    const { userId } = req;
    const { postId } = req.params;

    const result = await Post.edit(
     postId, {approved : true});
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

router.get('/user/:userId/:page?', async function (req, res, next) {
  try {
    const userId = req.params['userId'];
    const page = req.params['page'] ? req.params['page'] : 1;

    let posts = [];
    let nextPage = null;

    const records = await Post.getMy({page}, userId);
    if (records.docs.length > 0) {
      const postRecords = [...records.docs];

      await asyncForEach(postRecords, async post=>{
        const likes = await Like.getForContent(post._id);
        post.createdBy = await UserUtils.populateUser(post.createdBy._id, post.createdBy.userType);
        posts.push({...post, likes});
      });

      if (records.page < records.pages) {
        nextPage = "/post/user/"+userId+"/"+(parseInt(records.page) + 1);
      }
    }
    res.json({ posts, nextPage });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
  }
}

module.exports = router;
