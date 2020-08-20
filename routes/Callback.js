const express = require('express');
const router = express.Router();

const Callback = require('../models/Callback');
const TrainerData = require('../models/trainerData');
const UserData = require('../models/userData');
const utility = require('../utility/utility');
const fcm = require('../models/fcm');
const WEEK_DAYS_FULL_NAMES = require('../constants');
const {userTypes, WEEK_DAYS, remoteMessageTypes} = require('../constants');
const DateUtils = require('../utility/DateUtils');


router.post('/:trainerId/request', async function (req, res, next) {
  try {
    const {userId} = req;
    const {trainerId} = req.params;
    const trainerData = await TrainerData.getById(trainerId);

    const isCallRequested = await Callback.checkPendingCall(userId, trainerId);
    if (isCallRequested) {
      res.json({success: false, message: "You have already requested a call back with " + trainerData['name']})
    } else {
      const userData = await UserData.getById(userId);
      const token = await fcm.getToken(trainerId);

      if (!token) throw new Error("Unable to get FCM token");

      const msgText = userData.name + " has requested a call back";
      const message = {
        type: remoteMessageTypes.CALLBACK_REQ,
        text: msgText,
        displayImage: userData.displayPictureUrl,
        date:Date.now().toString()
      }
      await utility.sendNotification([token], message);

      const callback = await Callback.create({
        userId,
        trainerId,

      });
      if (!callback) throw new Error("Error in requesting call back");
      res.json({success: true, message: "Call back requested with " + trainerData.name});
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});


router.put('/:callbackId/accept', async function (req, res, next) {
  try {
    const {userId: selfId} = req;
    const {name: trainerName, displayPictureUrl: trainerImage} = await TrainerData.getById(selfId);
    const {callbackId} = req.params;
    const {userId} = await Callback.get(callbackId);
    const token = await fcm.getToken(userId);
    const message = {
      type: remoteMessageTypes.CALLBACK_ACCEPT,
      text: trainerName + ' has accepted your call request. Expect a call within 24 hours',
      displayImage: trainerImage,
    }
    await utility.sendNotification([token], message);
    await Callback.accept(callbackId);
    res.json({success: true});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});
router.put('/:callbackId/reject', async function (req, res, next) {
  try {
    const {callbackId} = req.params;
    await Callback.reject(callbackId);
    res.json({success: true});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});
router.put('/:callbackId/done', async function (req, res, next) {
  try {
    const {callbackId} = req.params;
    await Callback.done(callbackId);
    res.json({success: true});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});
router.get('/myCallbacks', async function (req, res, next) {
  try {
    const {userId, userType} = req;

    if (userType === userTypes.TRAINER) {
      const callbacks = await Callback.getTrainerCallbacks(userId);
      res.json({success: true, callbacks});
    } else
      res.status(401).json({success: false, message: 'Invalid user, only trainer can call this route'})

  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;