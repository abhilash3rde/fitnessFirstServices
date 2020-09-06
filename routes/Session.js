const express = require('express');
const router = express.Router();

const TrainerData = require('../models/trainerData');
const BatchSubscription = require('../models/BatchSubscription');
const Session = require('../models/Activity/Session');
const UserData = require('../models/userData');
const Fcm = require("../models/fcm");
const {getHash} = require("../utility/utility");
const {getAgoraAppId} = require("../utility/utility");
const {remoteMessageTypes} = require("../constants");
const {subscriptionType} = require("../constants");
const {getZakToken} = require("../utility/utility");
const {createZoomMeeting} = require("../utility/utility");
const {admin} = require('../config');

const defaultDp = 'https://media.istockphoto.com/photos/middle-aged-gym-coach-picture-id475467038';

router.post('/:sessionId/start', async function (req, res, next) {
  try {
    const {sessionId} = req.params;
    const {userId} = req;
    const session = await Session.getData(sessionId);
    if (userId !== session.trainerId)
      throw new Error('Unauthorised user');

    const trainerData = await TrainerData.getById(userId);
    const notificationMessage = `${trainerData.name} has started ${session.packageId.title} session`;
    if (session.type === subscriptionType.BATCH) {
      const meeting = await createZoomMeeting(session.packageId.title, new Date(), session.duration);
      const zakToken = await getZakToken();
      res.json({success: true, data: meeting, token: zakToken});

      const relatedSessions = await Session.getRelatedSessions(sessionId);
      await relatedSessions.map(async session => await Session.setLive(session._id, meeting));

      const batchSubscription = await BatchSubscription.getForPackage(session.packageId._id);
      const users = batchSubscription.subscriptions.map(subscription => subscription.subscribedBy);

      const message = {
        data: {
          type: remoteMessageTypes.SESSION_STARTED,
          message: notificationMessage,
          hostId: userId,
          displayImage: trainerData.displayPictureUrl,
          meetingId: meeting.id.toString(),
          meetingPassword: meeting.password,
          sentDate: new Date().toString(),
          sessionType: subscriptionType.BATCH
        }
      };
      await users.map(async user => {
        const fcmToken = await Fcm.getToken(user._id);
        await admin.messaging().sendToDevice(
          [fcmToken],
          message,
          {
            contentAvailable: true,
            priority: 'high',
          },
        );
      });
    } else if (session.type === subscriptionType.SINGLE) {
      const targetUserId = session.userId;
      const sessionId = (getHash(userId) | getHash(targetUserId)).toString();
      const agoraAppId = getAgoraAppId();
      const fcmToken = await Fcm.getToken(targetUserId);
      const userData = await UserData.getById(targetUserId);

      let {name, displayPictureUrl} = userData;
      if (!!!name) name = "User";
      if (!!!displayPictureUrl) displayPictureUrl = defaultDp;

      res.json({
        success: true, data: {
          agoraAppId,
          sessionId,
          displayPictureUrl,
          displayName: name
        }
      });
      await Session.setLive(session._id, {
        agoraAppId,
        sessionId,
        displayName:trainerData.name,
        displayImage:trainerData.displayPictureUrl
      });
      const message = {
        data: {
          type: remoteMessageTypes.SESSION_STARTED,
          message: notificationMessage,
          hostId: userId,
          displayImage: trainerData.displayPictureUrl,
          agoraAppId: agoraAppId,
          sessionId: sessionId,
          hostName:trainerData.name,
          sentDate: new Date().toString(),
          sessionType: subscriptionType.SINGLE
        }
      };
      await admin.messaging().sendToDevice(
        [fcmToken],
        message,
        {
          contentAvailable: true,
          priority: 'high',
        },
      );
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

router.post('/:sessionId/join', async function (req, res, next) {
  try {
    const {sessionId} = req.params;
    const {userId} = req;
    const session = await Session.getData(sessionId);
    if (userId !== session.userId)
      throw new Error('Unauthorised user');
    await Session.join(sessionId);
    res.json({success: true, data: session.data});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;