const express = require('express');
const router = express.Router();

const Slot = require('../models/slot');
const TrainerData = require('../models/trainerData');
const Youtube = require('../models/Youtube');
const utility = require('../utility/utility');

router.post('/createvideo', async function (req, res, next) {
  try {
    console.log(req.body)
    const {trainer_name , video_id} = req.body
const video= await Youtube.create({trainer_name,video_id})
    res.json({success:true,video});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});





router.get('/getvideos', async function (req, res, next) {
  try {
   const videos = await Youtube.getAllvideos()
    res.json({success:true,videos});

  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;