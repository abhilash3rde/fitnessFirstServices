const express = require('express');
const router = express.Router();

const TrainerData = require('../models/trainerData');
const Subscription = require('../models/Subscription');
const Utility = require('../utility/utility');

router.get('/myPackages', async function (req, res, next) {
    try {
      const { userId } = req;
      const trainerData = await TrainerData.getById(userId);
      
      if(!trainerData) {
        throw Error("Trainer not found")
      }
      res.json( trainerData.packages );
    } catch (err) {
      res.status(500).json({
        err: err.message
      });
    }
  });

  router.get('/mySlots', async function (req, res, next) {
    try {
      const { userId } = req;
      const trainerData = await TrainerData.getById(userId);
      
      if(!trainerData) {
        throw Error("Trainer not found")
      }

      const mySlots = await Utility.groupByTime(trainerData.slots);

      res.json( mySlots );
    } catch (err) {
      res.status(500).json({
        err: err.message
      });
    }
  });

  router.get('/mySubscribers', async function (req, res, next) {
    try {
        const { userId } = req;
        const subscriptions = await Subscription.getAllForTrainer(userId);
        
        if(!subscriptions) {
          throw Error("No Subscriptions")
        }

      const subscribers = subscriptions.flatMap(subscription => subscription.subscribedBy);
      res.json( subscribers );
    } catch (err) {
      res.status(500).json({
        err: err.message
      });
    }
  });

  router.get('/mySubscriptions', async function (req, res, next) {
    try {
      const { userId } = req;
      const subscriptions = await Subscription.getAllForTrainer(userId);
      
      if(!subscriptions) {
        throw Error("No Subscriptions")
      }
      res.json( subscriptions );
    } catch (err) {
      res.status(500).json({
        err: err.message
      });
    }
  });
  module.exports = router;