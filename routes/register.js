const express = require('express');
const {admin} = require('../config');
const router = express.Router();

const signJwt = require('../auth').sign;
const TrainerData = require('../models/trainerData');
const UserData = require('../models/userData');
const User = require('../models/user');
const Package = require('../models/package');
const Fcm = require('../models/fcm');

const {emailUsername} = require('../utility/utility');
const {userTypes} = require("../constants")

router.post('/googleAuth', async function (req, res, next) {
  try {
    let {idToken, fcmToken, userType} = req.body;
    console.log('Auth req for ', userType);
    let {name, picture, user_id, email} = await admin.auth().verifyIdToken(idToken);
    const ipInfo = req.ipInfo;

    if (!name)
      name = emailUsername(email);

    const existingUser = await User.get(email);
    if (existingUser)
      userType = existingUser.userType; // Change userType if already existing
    const Model = userType === userTypes.TRAINER ? TrainerData : UserData;

    if (!existingUser) {
      const user = await User.create({
        email,
        _id: user_id,
        userType
      });

      await Model.create({
        email,
        _id: user_id,
        displayPictureUrl: picture,
        name,
        city: ipInfo.city ? ipInfo.city : ''
      });
      if (!user) throw new Error("Unable to create user data");
    }
    await Fcm.setFcmToken(user_id, fcmToken);
    const userData = await Model.get(email);
    const authToken = await signJwt({userEmail: email, userType, userId: user_id});
    res.json({email, userId: user_id, authToken, userType, userData, isNewUser: !existingUser, success: true});
  } catch (err) {
    console.log(err);
    res.status(403).json({
      err: err.message
    });
  }
});

module.exports = router;
