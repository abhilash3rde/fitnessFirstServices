const express = require('express');
const router = express.Router();
const utility = require('../utility/utility');
const {saveFileToServer} = require('../config/uploadConfig');

const TrainerData = require('../models/trainerData');
const UserData = require('../models/userData');
const User = require('../models/user');
const {userTypes} = require("../constants");
const Subscription = require('../models/Subscription');

router.get('/myInfo', async function (req, res, next) {
  try {

    const {userId} = req;

    let user = await TrainerData.getById(userId);

    if (!user) {
      user = await UserData.getById(userId);
    }

    if (!user) throw new Error('Internal server error. code 45621');

    res.json({user});
  } catch (error) {
    res.status(500).json({error: error.toLocaleString()});
    console.log(error)
  }
});

router.put('/', async function (req, res, next) {
  try {
    console.log(`User ${req.userId} update request`);
    const {userId, userType} = req;
    let model = userType === userTypes.TRAINER ? TrainerData : UserData;
    const userData = await model.edit(
      userId,
      {
        ...req.body
      });
    if (userData) {
      res.json({success: true, userData});
    } else throw new Error("Could not update user data");
  } catch (error) {
    res.status(500).json({error: error.toLocaleString()});
  }
});

router.put('/displayImage', async function (req, res, next) {
  try {

    const mediaFile = req.files ? req.files.mediaContent : null;
    const content = await utility.uploadMedia(mediaFile);

    if (!content)
      throw new Error("Image upload failed");

    const contentURL = content.contentURL;

    const {userId, userType} = req;
    let model = userType === userTypes.TRAINER ? TrainerData : UserData;

    const userData = await model.edit(
      userId,
      {
        displayPictureUrl: contentURL,
      });
    if (!(userData && userData.email))
      throw new Error("display image updation failed");

    res.json({contentURL, success: true});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/wallImage', async function (req, res, next) {
  try {

    const mediaFile = req.files ? req.files.mediaContent : null;
    const content = await utility.uploadMedia(mediaFile);

    if (!content)
      throw new Error("Image upload failed");

    const contentURL = content.contentURL;

    const {userId, userType} = req;
    let model = userType === userTypes.TRAINER ? TrainerData : UserData;

    const userData = await model.edit(
      userId,
      {
        wallImageUrl: contentURL,
      });
    if (!(userData && userData.email))
      throw new Error("display image updation failed");

    res.json({contentURL, success: true});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.get('/mySubscriptions', async function (req, res, next) {
  try {
    const {userId, userType} = req;
    const subscriptions = userType === userTypes.USER ?
      await Subscription.getAllForUser(userId) :
      await Subscription.getAllForTrainer(userId);

    if (!subscriptions) {
      throw Error("No Subscriptions")
    }
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;
