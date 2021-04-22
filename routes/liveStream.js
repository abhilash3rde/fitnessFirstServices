const express = require('express');
const router = express.Router();

const {admin} = require('../config');
const LiveStream = require('../models/LiveStream');
const TrainerData = require('../models/trainerData');
const {zoomClientConfig} = require("../config");
const {userTypes, remoteMessageTypes, firebaseTopics} = require('../constants');
const {createZoomMeeting, getZakToken} = require('../utility/utility');
const meetings = require('../models/meetings')

router.post('/schedule', async function (req, res, next) {
  try {
    const {userId, userType} = req;
    if (userType === userTypes.USER) {
      res.status(401).json({message: 'User not authorised to create live stream'});
      return;
    }
    const {title, date, duration,instantLive} = req.body;
    const meeting = await createZoomMeeting(title, date, duration);
    const {name, displayPictureUrl} = await TrainerData.getById(userId);
    if(!instantLive){
      const notificationMessage = `${name} has scheduled a live session on ${title} on ${new Date(date).toLocaleDateString()}`;
      const message = {
        data: {
          type: remoteMessageTypes.GENERIC_NOTIFICATION,
          message: notificationMessage,
          hostId: userId,
          displayImage: displayPictureUrl,
          sentDate: new Date().toString()
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
      /*
      console.log(new Date(date))
      let endtime = new Date(date)
      endtime.setHours(new Date().getHours() + 1)
      endtime.setMinutes(00) 
      console.log(endtime)
      meetings.create({
          meetingNumber: meeting.id,
          status : "LIVE",
          startTime : new Date(date),
          endTime : endtime
      })
      */

    const model = await LiveStream.create({
      title,
      date,
      duration,
      host: userId,
      meetingNumber: meeting.id,
      meetingPassword: meeting.password,
      clientKey: zoomClientConfig.key,
      clientSecret: zoomClientConfig.secret,
      sentDate: new Date().toString()
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
    console.log("Starting meeting #", model.meetingNumber);

    if (model.host !== userId) {
      res.status(401).json({message: 'User not authorised to start this live stream'});
      return;
    }
    await LiveStream.setLive(streamId);
    const zakToken = await getZakToken();

    const {name, displayPictureUrl} = await TrainerData.getById(userId);
    const {title, meetingNumber, meetingPassword, clientKey, clientSecret} = model;
    const notificationMessage = `${name} has started a live session on ${title}`;

    const message = {
      data: {
        type: remoteMessageTypes.GENERIC_NOTIFICATION,
        message: notificationMessage,
        hostId: userId,
        displayImage: displayPictureUrl,
        meetingNumber: meetingNumber.toString(),
        meetingPassword,
        clientKey,
        clientSecret,
        sentDate: new Date().toString()
      },
      topic: firebaseTopics.SILENT_NOTIFICATION,
    };
    console.log(message);
    admin
      .messaging()
      .send(message)
      .then(response => {
        console.log('Successfully sent message:', response);
      })
      .catch(error => {
        console.log('Error sending message:', error);
      });

      
    res.json({success: true, token: zakToken});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

router.get('/list/:page?', async function (req, res, next) {
  try {
    let records = [];
    let nextPage = null;
    const page = req.params['page'] ? req.params['page'] : 1;
    records = await LiveStream.list({page});
    records.docs = records.docs.filter(data=>{return data.host.active === true})
    if (records.page < records.pages) {
      nextPage = "/live/list/" + (parseInt(records.page) + 1);
    }
    res.json({streams: records.docs, nextPage});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

router.get('/listMy/:page?', async function (req, res, next) {
  try {
    const {userId} = req;

    let records = [];
    let nextPage = null;
    const page = req.params['page'] ? req.params['page'] : 1;
    records = await LiveStream.list({page}, userId);
    if (records.page < records.pages) {
      nextPage = "/live/list/" + (parseInt(records.page) + 1);
    }
    res.json({streams: records.docs, nextPage});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;


