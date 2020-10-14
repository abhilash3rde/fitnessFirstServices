const express = require('express');
const router = express.Router();
const utility = require('../utility/utility');

const TrainerData = require('../models/trainerData');
const UserData = require('../models/userData');
const BmiHistory = require('../models/BmiHistory');
const User = require('../models/user');
const {userTypes, subscriptionType} = require("../constants");
const Subscription = require('../models/Subscription');
const BatchSubscription = require('../models/BatchSubscription');
const Activities = require('./Activities');
const Slot = require('../models/slot');
const Package = require('../models/package');
const TermsConsent = require('../models/termsConsent');
const Session = require("../models/Activity/Session");
const {sessionTypes, sessionStatus} = require('../constants');

const { session } = require('passport');

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

    if (!user) throw new Error('User does not exist!');

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
          },
          type: subscriptionType.SINGLE
        })
      } else {
        //Check if it is batch subscription
        const batchSubscription = await BatchSubscription.getForPackage(subscription.packageId);
        if (batchSubscription) {
          const {slot} = await Package.get(subscription.packageId);
          if (userType === userTypes.USER) {
            mySubscriptions.push({
                active: subscription.active,
                heldSessions: subscription.heldSessions,
                totalSessions: subscription.totalSessions,
                endDate: subscription.endDate,
                _id: subscription._id,
                startDate: subscription.startDate,
                package: subscription.packageId,
                trainer: {
                  userType: subscription.trainerId.userType,
                  name: subscription.trainerId.name,
                  _id: subscription.trainerId._id,
                  displayPictureUrl: subscription.trainerId.displayPictureUrl,
                },
                user: {},
                slot: {
                  time: slot.time,
                  daysOfWeek: slot.days
                },
                type: subscriptionType.SINGLE // Single as view layer expects single, actually is a batch
              }
            )
          } else {
            // Batch for trainer
            let users = [];
            await batchSubscription.subscriptions.map(async subscription => {
              const {name, _id, displayPictureUrl} = subscription.subscribedBy;
              const {startDate, endDate, heldSessions, totalSessions} = subscription;
              users.push({
                name,
                _id,
                displayPictureUrl,
                startDate,
                endDate,
                heldSessions,
                totalSessions
              })
            });
            mySubscriptions.push({
              active: batchSubscription.active,
              endDate: batchSubscription.endDate,
              _id: batchSubscription._id,
              startDate: batchSubscription.startDate,
              package: batchSubscription.packageId,
              trainer: {},
              heldSessions: batchSubscription.heldSessions,
              totalSessions: batchSubscription.totalSessions,
              users,
              slot: {
                time: slot.time,
                daysOfWeek: slot.days
              },
              subscribedCount: batchSubscription.subscriptions.length,
              maxParticipants: batchSubscription.packageId.maxParticipants,
              type: subscriptionType.BATCH
            })
          }
        }

      }
    });

    if (!subscriptions) {
      throw Error("No Subscriptions")
    }
    res.json({subscriptions: mySubscriptions});
  } catch (err) {
    console.log(err)
    res.status(500).json({
      err: err.message
    });
  }
});
router.get('/mySessions', async function (req, res, next) {
  try {
    const {userId, userType} = req;
    if (userType === userTypes.USER) {
      const sessions = await Session.getForUser(userId)
     sessions.map(data =>{
        var now = new Date();
      if(now - data.date > 0 && !data.startTime ) {
        Session.setNotheld(data._id)
        data.status = sessionStatus.NOTHELD
      }
      })
      res.json({sessions});

    } else {
      const sessions = await Session.getForTrainer(userId)
      sessions.map(data =>{
        var now = new Date();
        if(now - data.date > 0 && !data.startTime ) {
          console.log(data,"Not Held")
        Session.setNotheld(data._id)
        data.status = sessionStatus.NOTHELD
        }
      })
      // console.log(sessions)
      res.json({sessions});
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({
      err: err.message
    });
  }
});

router.post('/acceptTerms', async function (req, res, next) {
  try {
    const {userId} = req;
    await TermsConsent.create(userId);
    res.json({success: true});
  } catch (error) {
    res.status(500).json({error: error.toLocaleString()});
    console.log(error)
  }
});
module.exports = router;
