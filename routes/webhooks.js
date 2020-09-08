const express = require('express');
const router = express.Router();

const {admin} = require('../config');
const LiveStream = require('../models/LiveStream');
const Zoom = require('../models/Activity/Zoom');
const Session = require('../models/Activity/Session');
const {firebaseTopics} = require("../constants");
const {remoteMessageTypes} = require("../constants");

router.post('/endMeeting/', async function (req, res, next) {
  try {
    const {payload} = req.body;
    const {id: meetingNumber} = payload.object;
    const success = await LiveStream.setFinished(meetingNumber);
    if (!success) {
      // meetingId did not belong to a live stream, check for zoom session
      const sessionId = await Zoom.getParentSessionId(meetingNumber);
      if (sessionId) {
        await Session.setFinished(sessionId);
        const message = {
          data: {
            type: remoteMessageTypes.SYNC_SESSIONS,
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
      }
    }
    res.json({success: true});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;


