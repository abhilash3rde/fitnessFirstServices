const express = require('express');
const router = express.Router();

const LiveStream = require('../models/LiveStream');

router.post('/endMeeting/', async function (req, res, next) {
  try {
    const {payload} = req.body;
    const {id: meetingId} = payload.object;
    await LiveStream.setFinished(meetingId);
    res.json({success: true});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;


