const express = require('express');
const router = express.Router();

const LiveStream = require('../models/LiveStream');
const {userTypes} = require('../constants');
const {createZoomMeeting, getZakToken} = require('../utility/utility');

router.post('/schedule', async function (req, res, next) {
  try {
    const {userId, userType} = req;
    if (userType === userTypes.USER) {
      res.status(401).json({message: 'User not authorised to create live stream'});
      return;
    }
    const {title, date, duration} = req.body;
    const meeting = await createZoomMeeting(title, date, duration);
    const model = await LiveStream.create({
      title,
      date,
      duration,
      hostId: userId,
      meetingId: meeting.id,
      meetingPassword: meeting.password
    });
    res.json({success: true, stream: model});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/start', async function (req, res, next) {
  try {
    const {userId} = req;

    const {streamId} = req.body;
    const model = await LiveStream.get(streamId);
    if (model.hostId !== userId) {
      res.status(401).json({message: 'User not authorised to start this live stream'});
      return;
    }
    await LiveStream.setLive(streamId);
    const zakToken = await getZakToken();
    res.json({success: true, token:zakToken});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;


