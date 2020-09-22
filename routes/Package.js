const express = require('express');
const router = express.Router();
const Slot = require('../models/slot');
const Package = require('../models/package');
const TrainerData = require('../models/trainerData');
const { default: validator } = require('validator');

router.post('/create', async function (req, res, next) {
  try {
    const {userId} = req;
    const {title, noOfSessions, price, description, category, group, maxParticipants, slot, startDate} = req.body;
    const package = await Package.create({
      title, noOfSessions, price, description, category, group, maxParticipants, slot, startDate
    });
    if (!package) throw new Error("Error in creating package");
    await TrainerData.addPackage(userId, package._id);

    if (group) {
      const {days, time, duration} = slot;
      const availableSlots = await Slot.getBookedSlots(userId)
      console.log(availableSlots)
      days.map((day, i)=>{
        availableSlots.map((slott, index) => {
          if (day === slott.dayOfWeek && time === slott.time && !slott.group && slott.active)
           throw new Error(`Slot already taken on ${day}`);
           })   
       })   
       const slots = [];
       days.map(day => slots.push({
         time,
         dayOfWeek: day,
         duration: duration,
         trainerId: userId,
         group: true,
         packageId: package._id
       }));
       const insertedSlots = await Slot.insertAll(slots);
       await TrainerData.addSlots(userId, insertedSlots);
    }
    res.json({package});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/:packageId', async function (req, res, next) {
  try {
    const {userId} = req;

    const {packageId} = req.params;
    const {title, noOfSessions, price, description, category, group, maxParticipants, slot, startDate, active} = req.body;
    const package_ = await Package.edit(packageId, {
      title, noOfSessions, price, description, category, group, maxParticipants, slot, startDate, active
    });
    if (!package_) throw new Error("Error in editing package");
    if (group) {
      const {days, time, duration} = slot;

      let {slots} = await TrainerData.getById(userId);
      slots = slots.filter(slot => slot.packageId === packageId);

      await TrainerData.removeSlots(userId, slots);
      await slots.map(async slot => {
        await Slot.remove(slot._id);
      });

      const newSlots = []
      days.map(day => newSlots.push({
        time,
        dayOfWeek: day,
        duration: duration,
        trainerId: userId,
        group: true,
        packageId
      }));
      const insertedSlots = await Slot.insertAll(newSlots);
      await TrainerData.addSlots(userId, insertedSlots);
    }
    res.json({package: package_, success: true});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

router.get('/:packageId', async function (req, res, next) {
  try {
    const {packageId} = req.params;

    const package_ = await Package.get(packageId);
    if (!package_) throw new Error("Error in locating package");
    console.log(package_)
    res.json({package: package_});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.delete('/:packageId', async function (req, res, next) {
  try {
    const {packageId} = req.params;

    const package_ = await Package.remove(packageId);
    if (!package_) throw new Error("Error in deleting package");

    res.json({success: true});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/:packageId/activate', async function (req, res, next) {
  try {
    const {packageId} = req.params;
    await Package.activatePackage(packageId);
    res.json({success: true});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/:packageId/deactivate', async function (req, res, next) {
  try {
    const {packageId} = req.params;
    await Package.deactivatePackage(packageId);
    res.json({success: true});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;