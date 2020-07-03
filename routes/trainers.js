const express = require('express');
const router = express.Router();

const TrainerData = require('../models/trainerData');
const UserData = require('../models/userData');
const Slot = require('../models/slot');
const Package = require('../models/package');
const {userTypes} = require("../constants")

router.get('/', async function (req, res, next) {
  try {
    const {userType} = req;
    let users;
    if(userType===userTypes.USER)
     users = await TrainerData.list();
    else users = await UserData.list()

    res.json({trainers:users});
  } catch (err) {
    console.log(err)
    res.status(500).json({
      err: err.message
    });
  }
});

router.post('/slot', async function (req, res, next) {
  try {
    const {userId} = req;
    const {startTime, duration, startDate, endDate} = req.body;

    const slot = await Slot.create({
      startTime, duration, startDate, endDate
    });
    if (!slot) throw new Error("Error in creating slot");

    const trainer = await TrainerData.addSlot(userId, slot._id);
    res.json({trainer});

  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/slot/:slotId', async function (req, res, next) {
  try {
    const {slotId} = req.params;
    const {startTime, duration, startDate, endDate, assignedTo} = req.body;

    const slot = await Slot.edit(slotId, {
      startTime, duration, startDate, endDate, assignedTo
    });
    if (!slot) throw new Error("Error in modifying slot");

    res.json({slot, success: true});

  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.delete('/slot/:slotId', async function (req, res, next) {
  try {
    const {slotId} = req.params;
    const {userId} = req;

    const trainer = await TrainerData.removeSlot(userId, slotId);

    res.json({success: true});

  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});


router.post('/package', async function (req, res, next) {
  try {
    const {userId} = req;
    const {title, duration, price, description} = req.body;

    const package_ = await Package.create({
      title, duration, price, description
    });
    if (!package_) throw new Error("Error in creating package");

    const trainer = await TrainerData.addPackage(userId, package_._id);
    res.json({package_});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/package/:packageId', async function (req, res, next) {
  try {
    const {packageId} = req.params;
    const {title, duration, price, description} = req.body;

    const package_ = await Package.edit(packageId, {
      title, duration, price, description
    });
    if (!package_) throw new Error("Error in editing package");

    res.json({package_});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.delete('/package/:packageId', async function (req, res, next) {
  try {
    const {userId} = req;
    const {packageId} = req.params;

    const trainer = await TrainerData.removePackage(userId, packageId);
    res.json({success: true});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;
