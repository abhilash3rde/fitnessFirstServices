const express = require('express');
const router = express.Router();
const Like = require('../models/like');
const Question = require('../models/question');
const UserUtils = require('../utility/userUtils')
const Utility = require('../utility/utility')

router.get('/getAll/:page?', async function (req, res, next) {
    try {
  
      const page = req.params['page'] ? req.params['page'] : 1;
  
      let questions = [];
      let nextPage = null;
      const records = await Question.list({page});
      if (records.docs.length > 0) {
        questionRecords = [...records.docs];

        await Utility.asyncForEach(questionRecords, async question=>{
          question.postedBy = await UserUtils.populateUser(question.postedBy._id, question.postedBy.userType);
          const answerRecords = question.answers;
          let answers = [];

          await Utility.asyncForEach(answerRecords, async answer=>{
            answer.postedBy = await UserUtils.populateUser(answer.postedBy._id, answer.postedBy.userType);
            answers.push({...answer});
          });
          question.answers = [...answers];
          questions.push({...question});
        });

        if (records.page < records.pages) {
          nextPage = "/question/getAll/"+(parseInt(records.page) + 1);
        }
      }
      res.json({ questions, nextPage });
    } catch (err) {
      res.status(500).json({
        err: err.message
      });
    }
  });

router.post('/', async function (req, res, next) {
  try {
    
    const { userId } = req;
    const { questionText } = req.body;

    const question = await Question.create({
        postedBy: userId,
        questionText
    });
    if (!question) throw new Error("Failed to post question");

    res.json({ question });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.get('/:questionId', async function (req, res, next) {
    try {
      
      const { userId } = req;
      const { questionId } = req.params;
  
      const question = await Question.get(questionId);
      if (!question) throw new Error("Failed to get question");
  
      res.json({ question });
    } catch (err) {
      res.status(500).json({
        err: err.message
      });
    }
  });

router.put('/:questionId', async function (req, res, next) {
  try {
    const { questionId } = req.params;
    const { userId } = req;
    const { questionText } = req.body;

    const question = await Question.edit(questionId, {
        questionText
    });
    if (!question) throw new Error("Failed to edit Question");

    res.json({ question });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.post('/:questionId/like', async function (req, res, next) {
  try {
    const { userId } = req;
    const { questionId } = req.params;

    const result = await Like.create({
      likedBy : userId,
      contentId: questionId,
      contentType: 'QUESTION'
    })
    if (result)
      res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.post('/:questionId/unlike', async function (req, res, next) {
  try {
    const { questionId } = req.params;

    const result = await Like.unlike(questionId);

    if (result)
      res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/:questionId/reportSpam', async function (req, res, next) {
  try {
    const { questionId } = req.params;
    const result = await Question.edit(questionId, {spam: true});

    if (result)
      res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});


//Admin only
router.put('/:questionId/removeSpam', async function (req, res, next) {
  try {
    const { questionId } = req.params;
    const result = await Question.edit(questionId, {spam: false});

    if (result)
      res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

//Admin only
router.put('/:questionId/approve', async function (req, res, next) {
  try {
    const { userId } = req;
    const { questionId } = req.params;

    const result = await Question.edit(
        questionId, {approved : true});
    if (result)
      res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;
