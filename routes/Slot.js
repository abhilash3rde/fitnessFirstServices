const express = require('express');
const router = express.Router();

const Slot = require('../models/slot')
const TrainerData = require('../models/trainerData');
const utility = require('../utility/utility');

router.post('/createOrUpdate', async function (req, res, next) {
  try {
    const { userId } = req;
    const requestSlots = req.body;

    const newSlots = [];
    const updatedSlots = [];
    let processedSlots = [];

    let trainerData = await TrainerData.getById(userId);

    requestSlots.map(requestSlot => {
      const time = requestSlot.time;
      const duration = requestSlot.duration;

      const bookedSlots = trainerData.slots.filter(
        slot => {
          return slot.time === time && requestSlot.days.includes(slot.dayOfWeek)
        }).flatMap(slots => slots.dayOfWeek);

      requestSlot.days.map(async day => {
        if (!bookedSlots.includes(day)) {
          newSlots.push({
            time,
            dayOfWeek: day,
            duration: duration,
            trainerId: userId
          });
        }
        else {
          const updateSlot = await Slot.updateForDayTime(day, time, { duration });
          updatedSlots.push(updateSlot)
        }
      });
    });

    const insertedSlots = await Slot.insertAll(newSlots);
    trainerData = await TrainerData.addSlots(userId, insertedSlots);

    processedSlots = await utility.groupByTime([...updatedSlots, ...insertedSlots]);

    res.json(processedSlots);
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/:slotId', async function (req, res, next) {
  try {
    const { slotId } = req.params;
    const { time, dayOfWeek, duration } = req.body;

    const oldSlot = await Slot.get(slotId);
    const existingSlot = await Slot.findForDayAndTime(dayOfWeek, time);

    console.log("existingSlot=>", existingSlot);

    if (oldSlot._id !== existingSlot._id) {
      throw Error("Slot already available for " + dayOfWeek + " at " + time);
    }

    const slot = await Slot.edit(slotId, {
      time, dayOfWeek, duration
    });
    if (!slot) throw new Error("Error in modifying slot");

    res.json({ slot, success: true });

  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.delete('/:slotId', async function (req, res, next) {
  try {
    const { slotId } = req.params;
    const { userId } = req;

    await Slot.remove(slotId);
    const trainerData = await TrainerData.removeSlot(userId, slotId);

    res.json({ success: true, trainerData });

  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.get('/getAllAvailable', async function (req, res, next) {
  try {
    const allSlots = await Slot.getAllAvailableSlots();
    const refinedSlots = [];

    allSlots.map(slot => {
      // daysSet.add(slot.dayOfWeek);
      // timesSet.add(slot.time);
      const { name, experience, rating, city, totalSlots, availableSlots } = slot.trainerId ;
      slot['trainerId'] = { name, experience, rating, city, totalSlots, availableSlots};

      refinedSlots.push(slot);
    });    

    const availableSlots = await utility.groupBy(refinedSlots, ['dayOfWeek']);
    let resultSlots = [];

    Object.keys(availableSlots).map(day=>{
      const timeSet = new Set();

      availableSlots[day].map(slot=>{
        timeSet.add(slot.time);
      })

      const times = Array.from(timeSet);
      const slots = availableSlots[day];
      resultSlots.push({
        times,
        slots
      })
      availableSlots[day] = resultSlots;
      resultSlots = [];
    });

    res.json({ availableSlots });

  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;