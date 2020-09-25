const express = require('express');
const {admin} = require('../config');
const {userTypes} = require("../constants")
const TrainerData = require('../models/trainerData');
const UserData = require('../models/userData');
const ActiveCalls = require('../models/activeCalls');
const router = express.Router();

const defaultDp = 'https://media.istockphoto.com/photos/middle-aged-gym-coach-picture-id475467038';
const Fcm = require('../models/fcm');
const {getAgoraAppId} = require("../utility/utility");
const {getHash} = require("../utility/utility");
const {remoteMessageTypes} = require('../constants');

router.post('/', async function (req, res, next) {
  try {
    const {targetUserId} = req.body;
    const {userId, userType} = req;
    const sessionId = (getHash(userId) | getHash(targetUserId)).toString();
    const isBusy = await ActiveCalls.isBusy(targetUserId);
    if (isBusy) {
      res.json({success: false, message: "User is on another call"});
      return;
    }
    const fcmToken = await Fcm.getToken(targetUserId);
    let userData = {}, targetUserData ={};
    if (userType === userTypes.TRAINER) {
      userData = await TrainerData.getById(userId);
      targetUserData = await UserData.getById(targetUserId);
    } else {
      userData = await UserData.getById(userId);
      targetUserData = await TrainerData.getById(targetUserId);
    }

    let {name, displayPictureUrl} = userData;
    if (!!!name) name = "User";
    if (!!!displayPictureUrl) displayPictureUrl = defaultDp;

    let {name:targetName, displayPictureUrl:targetDisplayPictureUrl} = targetUserData;
    if (!!!targetName) targetName = "User";
    if (!!!targetDisplayPictureUrl) targetDisplayPictureUrl = defaultDp;

    console.log(name, displayPictureUrl, sessionId);
    const agoraAppId = getAgoraAppId();
    await admin.messaging().sendToDevice(
      [fcmToken],
      {
        data: {
          "priority": "high",
          "type": remoteMessageTypes.CALL,
          "sessionId": sessionId,
          "agoraAppId": agoraAppId,
          "dpUrl": displayPictureUrl,
          "displayName": name
        }
      },
      {
        contentAvailable: true,
        priority: 'high',
      },
    );
    await ActiveCalls.create(userId);
    const data={sessionId, agoraAppId, displayPictureUrl:targetDisplayPictureUrl, displayName: targetName, success: true}
    console.log(data,"Start Call ")
    res.json(data); // TODO : add call config here
  } catch (err) {
    console.log(err)
    res.status(500).json({
      err: err.message
    });
  }
});

router.get('/active', async function (req, res, next) {
  try {
    const {userId} = req;
    await ActiveCalls.create(userId);
    res.json({success: true});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

router.get('/inactive', async function (req, res, next) {
  try {
    const {userId} = req;
    await ActiveCalls.remove(userId);
    res.json({success: true});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;
