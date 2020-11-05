const express = require('express');
const router = express.Router();
const Like = require('../models/like');
const Question = require('../models/question');
const Answer = require('../models/answer');
const Logger = require('../services/logger_service')
let logg = new Logger('answer')
router.post('/:questionId', async function (req, res, next) {
    try {
      const { userId } = req;
      const { questionId } = req.params;
      const { answerText} = req.body;
logg.info('answerbeforesave',{userId,questionId,answerText})
      const answer = await Answer.create({
          postedBy: userId,
          answerText
      });

      let question;
      if(answer){
        question = await Question.addAnswer(questionId, answer._id);
      }

      if (question){
        res.json({ question });

logg.info('answeraftersave',{question})
      }
    } catch (err) {
      res.status(500).json({
        err: err.message
      });
    }
  });

router.put('/:answerId', async function (req, res, next) {
  try {
    const { answerId } = req.params;
    const { userId } = req;
    const { answerText } = req.body;

    const answer = await Answer.edit(answerId, {
        answerText
    });
    if (!answer) throw new Error("Failed to edit Answer");

    res.json({ answer });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.post('/:answerId/like', async function (req, res, next) {
  try {
    const { userId } = req;
    const { answerId } = req.params;

    const result = await Like.create({
      likedBy : userId,
      contentId: answerId,
      contentType: 'ANSWER'
    })
    if (result){
      logg.info(`answer/${answerId,userId}`,{result})
      res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.post('/:answerId/unlike', async function (req, res, next) {
  try {
    const { answerId } = req.params;

    const result = await Like.unlike(answerId);

    if (result)
      res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/:answerId/reportSpam', async function (req, res, next) {
  try {
    const { answerId } = req.params;
    const result = await Answer.edit(answerId, {spam: true});

    if (result)
      res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});


//Admin only
router.put('/:answerId/removeSpam', async function (req, res, next) {
  try {
    const { answerId } = req.params;
    const result = await Answer.edit(answerId, {spam: false});

    if (result)
      res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;


