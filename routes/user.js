const express = require('express');
const router = express.Router();
const utility = require('../utility/utility');
const {saveFileToServer} = require('../config/uploadConfig');

const TrainerData = require('../models/trainerData');
const UserData = require('../models/userData');
const BmiHistory = require('../models/BmiHistory');
const User = require('../models/user');
const {userTypes} = require("../constants");
const Subscription = require('../models/Subscription');
const Activities = require('./Activities');
const Slot = require('../models/slot');

router.get('/myInfo', async function (req, res, next) {
  try {

    const {userId, userType} = req;
    let upcomingActivities;
    let user;

    if (userTypes.TRAINER === userType) {
      user = await TrainerData.getById(userId);
      upcomingActivities = await Activities.getTrainerActivities(userId);
    } else {
      user = await UserData.getById(userId);
      upcomingActivities = await Activities.getUserActivities(userId);
    }

    if (!user) throw new Error('Internal server error. code 45621');

    res.json({user, upcomingActivities});
  } catch (error) {
    res.status(500).json({error: error.toLocaleString()});
    console.log(error)
  }
});

router.get('/info/:userId', async function (req, res, next) {
  try {

    const {userId} = req.params;

    let upcomingActivities;
    let {userType} = await User.getById(userId);
    let user;

    if (userTypes.TRAINER === userType) {
      user = await TrainerData.getById(userId);
      upcomingActivities = await Activities.getTrainerActivities(userId);
    } else {
      user = await UserData.getById(userId);
      upcomingActivities = await Activities.getUserActivities(userId);
    }

    if (!user) throw new Error('Internal server error. code 45621');

    res.json({user, upcomingActivities});
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
    console.log(req.body);
    const userData = await model.edit(
      userId,
      {
        ...req.body
      });
    if (req.body.weight && req.body.height) {
      const bmi = utility.calculateBmi(req.body.weight, req.body.height);
      const record = await BmiHistory.create({
        bmi,
        weight: req.body.weight,
        userId
      });
      console.log("saved bmi", record);
    }
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

    const mySubscriptions = [];

    const subscriptions = userType === userTypes.USER ?
      await Subscription.getAllForUser(userId) :
      await Subscription.getAllForTrainer(userId);

    await utility.asyncForEach(subscriptions, async subscription => {
      const result = await Slot.getDayAndTime({"subscriptionId": subscription._id});

      const subsData = {
        active: subscription.active,
        heldSessions: subscription.heldSessions,
        totalSessions: subscription.totalSessions,
        endDate: subscription.endDate,
        _id: subscription._id,
        startDate: subscription.startDate,
      };

      // console.log("result", result)

      if (result && result.length > 0) {

        let trainerData = {};
        let userData = {};

        //User need trainer data...
        if (userType === userTypes.USER) {
          trainerData = {
            userType: subscription.trainerId.userType,
            name: subscription.trainerId.name,
            _id: subscription.trainerId._id,
            displayPictureUrl: subscription.trainerId.displayPictureUrl,
          };
        } else {
          userData = {
            userType: subscription.subscribedBy.userType,
            name: subscription.subscribedBy.name,
            _id: subscription.subscribedBy._id,
            displayPictureUrl: subscription.subscribedBy.displayPictureUrl,
          };
        }

        mySubscriptions.push({
          ...subsData,
          package: subscription.packageId,
          trainer: trainerData,
          user: userData,
          slot: {
            time: result[0]._id, //dont change groupBy field
            daysOfWeek: result[0].daysOfWeek
          }
        })
      }
    });

    if (!subscriptions) {
      throw Error("No Subscriptions")
    }
    // console.log('my ', mySubscriptions);
    res.json(mySubscriptions);
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;
