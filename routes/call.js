const express = require('express');
const cuid = require('cuid');
const {admin} = require('../config');
const {userTypes} = require("../constants")
const TrainerData = require('../models/trainerData');
const UserData = require('../models/userData');
const router = express.Router();

const Fcm = require('../models/fcm');
const {agoraAppId} = require('../constants');

router.get('/:targetUserId', async function (req, res, next) {
  try {
    const {targetUserId} = req.params;
    const {userId, userType} = req;
    const sessionId = cuid();

    const fcmToken = await Fcm.getToken(targetUserId);
    let userData = {};
    if(userType===userTypes.TRAINER){
      userData = await TrainerData.getById(userId);
    }else userData = await UserData.getById(userId);


    let {name,displayPictureUrl} = userData;
    if(!!!name)name ="User";
    if(!!!displayPictureUrl)displayPictureUrl='https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png';

    console.log(name,displayPictureUrl)
    await admin.messaging().sendToDevice(
      [fcmToken],
      {
        data: {
          "priority": "high",
          "sessionId": sessionId,
          "agoraAppId": agoraAppId,
          "type": "call",
          "dpUrl":displayPictureUrl,
          "displayName":name
        }
      },
      {
        contentAvailable: true,
        priority: 'high',
      },
    );
    res.json({sessionId, agoraAppId}); // TODO : add call config here
  } catch (err) {
    console.log(err)
    res.status(500).json({
      err: err.message
    });
  }
});


module.exports = router;
