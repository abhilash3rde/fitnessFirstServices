const express = require('express');
const {admin} = require('../config');
const router = express.Router();

const signJwt = require('../auth').sign;
const TrainerData = require('../models/trainerData');
const UserData = require('../models/userData');
const User = require('../models/user');
const Package = require('../models/package');
const Fcm = require('../models/fcm');

const {userTypes} = require("../constants")

const createUser = async (email, password, userType) => {
  const user = await User.create({
    email,
    password,
    userType
  });
  if (!(user && user.email))
    throw new Error("User creation failed");
  const {_id} = user;
  const data = userType === userTypes.TRAINER ?
    await TrainerData.create({email, _id}) :
    await UserData.create({email, _id});
  if (!(data && data.email))
    throw new Error("user data creation failed");

  if (userType === userTypes.TRAINER) {
    // Create a default package and add it
    const package_ = await Package.create();
    if (!package_) throw new Error("Error in creating package");
    const trainer = await TrainerData.addPackage(_id, package_._id);
    if (!trainer) throw new Error("Error in adding default package");
  }

  return user;
}

router.post('/trainer', async function (req, res, next) {
  try {
    const {email, password} = req.body;
    const {_id} = await createUser(email, password, userTypes.TRAINER); // auto handles error
    const authToken = await signJwt({userEmail: email, userType: userTypes.TRAINER, userId: _id});
    res.json({email, userId: _id, authToken, userType: userTypes.TRAINER, success: true});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.post('/user', async function (req, res, next) {
  try {
    const {email, password} = req.body;
    const {_id} = await createUser(email, password, userTypes.USER); // auto handles error
    const authToken = await signJwt({userEmail: email, userType: userTypes.USER, userId: _id});
    res.json({email, userId: _id, authToken, userType: userTypes.User, success: true});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});


router.post('/googleAuth', async function (req, res, next) {
  try {
    const {idToken, fcmToken} = req.body;
    let {name, picture, user_id, email} = await admin.auth().verifyIdToken(idToken);
    const ipInfo = req.ipInfo;

    const userExists = await User.getById(user_id);
    if (userExists) {
      const userFcm = await Fcm.setFcmToken(user_id, fcmToken);
      if (!userFcm) throw new Error("Unable to set FCM");
      const {userType} = userExists;
      switch (userType) {
        case userTypes.USER: {
          if (!name) name = 'User';
          const user = await UserData.create({
            email,
            _id: user_id,
            displayPictureUrl: picture,
            name,
            city: ipInfo.city ? ipInfo.city : ''
          })
          if (!user) throw new Error("Unable to create user");

          const authToken = await signJwt({userEmail: email, userType: userTypes.USER, userId: user_id});
          res.json({email, userId: user_id, authToken, userType: userTypes.USER, success: true, newUser: false});
        }
          break;
        case userTypes.TRAINER: {
          if (!name) name = 'Trainer';
          const trainer = await TrainerData.create({
            email,
            _id: user_id,
            displayPictureUrl: picture,
            name,
            city: ipInfo.city ? ipInfo.city : ''
          })
          if (!trainer) throw new Error("Unable to create trainer");
          const authToken = await signJwt({userEmail: email, userType: userTypes.TRAINER, userId: user_id});
          res.json({email, userId: user_id, authToken, userType: userTypes.TRAINER, success: true, newUser: false});
        }
          break;
      }
    } else {
      const user = await User.create({
        email,
        _id: user_id,
      })
      if (!user) throw new Error("Unable to create user");
      res.json({newUser: true, success: true});
    }
  } catch (err) {
    console.log(err);
    res.status(403).json({
      err: err.message
    });
  }
});

router.post('/setUserType', async function (req, res, next) {
  try {
    const {userType, idToken} = req.body;
    let {user_id} = await admin.auth().verifyIdToken(idToken);
    await User.setUserType(user_id, userType);
    res.json({success: true});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});


module.exports = router;
