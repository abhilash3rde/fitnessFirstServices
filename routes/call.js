const express = require('express');
const cuid = require('cuid');
const {admin} = require('../config');
const {userTypes} = require("../constants")
const TrainerData = require('../models/trainerData');
const UserData = require('../models/userData');
const ActiveCalls = require('../models/activeCalls');
const router = express.Router();

const Fcm = require('../models/fcm');
const {agoraAppId} = require('../constants');

const getHash = (str) => {
  let hash = 0, i, chr;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

router.post('/', async function (req, res, next) {
  try {
    const {targetUserId} = req.body;
    const {userId, userType} = req;
    const sessionId = (getHash(userId) | getHash(targetUserId)).toString();
    const isBusy = await ActiveCalls.isBusy(targetUserId);
    if(isBusy){
      res.json({success:false, message:"User is on another call"});
      return;
    }
    const fcmToken = await Fcm.getToken(targetUserId);
    let userData = {};
    if (userType === userTypes.TRAINER) {
      userData = await TrainerData.getById(userId);
    } else userData = await UserData.getById(userId);

    let {name, displayPictureUrl} = userData;
    if (!!!name) name = "User";
    if (!!!displayPictureUrl) displayPictureUrl = 'https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png';

    console.log(name, displayPictureUrl, sessionId);
    await admin.messaging().sendToDevice(
      [fcmToken],
      {
        data: {
          "priority": "high",
          "type": "call",
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
    res.json({sessionId, agoraAppId, success:true}); // TODO : add call config here
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
