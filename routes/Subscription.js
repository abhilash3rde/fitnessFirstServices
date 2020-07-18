const express = require('express');
const router = express.Router();

const TrainerData = require('../models/trainerData');
const Subscription = require('../models/Subscription');
const Slot = require('../models/slot');
const Package = require('../models/package');
const Utility = require('../utility/utility');
const paymentModule = require('../config/payment');
const Transaction = require('../models/Transaction');
const DateUtils = require('../utility/DateUtils');

router.post('/:trainerId/:packageId', async function (req, res, next) {
  try {
    const { userId } = req;
    const { trainerId, packageId } = req.params;

    const { time, days, startDate } = req.body;

    const trainerData = await TrainerData.getById(trainerId);
    const package = trainerData.packages.find(package => package._id === packageId);

    const availableSlots = trainerData.slots.filter(slot => {
      if (!slot.subscriptionId && slot.time === time && days.includes(slot.dayOfWeek)) {
        return true;
      }
    });

    const availableDays = availableSlots.flatMap(availableSlot => availableSlot.dayOfWeek);

    if (!package) {
      throw new Error("Invalid package");
    }

    if (!days || !days.length > 0) {
      throw new Error("Training days missing");
    }

    Utility.findMissingValue(days, availableDays, day => {
      if (day.length > 0) {
        throw new Error("Slot not available for " + day + " at " + time);
      }
    });

    const _subscription = await Subscription.create({
      packageId, trainerId, subscribedBy: userId, totalSessions: package.noOfSessions, startDate
    });

    availableSlots.map(async slot => {
      await Slot.edit(slot._id, {
        subscriptionId: _subscription._id
      })
    });

    const approxDuration = package.noOfSessions / days.length;

    const metadata = {
      packageName: package.title,
      sessionCount: package.noOfSessions,
      price: package.price,
      time,
      days,
      approxDuration,
      subscriptionId: _subscription._id,
      trainerName: trainerData.name
    };
    const options = {
      amount: 100 * parseInt(package.price),  // amount in the smallest currency unit
      currency: "INR",
      receipt: _subscription._id,
      payment_capture: '1',
      notes: {
        "subscriptionId": _subscription._id
      }
    };
    const order = await paymentModule.orders.create(options);

    if (!order) {
      throw Error("Error creating order");
    }

    const transaction = await Transaction.create({
      orderId: order.id,
      subscriptionId: order.receipt,
      transferAttempts: order.attempts,
      status: order.status
    });

    if (!transaction) {
      throw Error("Error while creating Transaction");
    }

    // await Subscription.activateSubscription(_subscription._id);
    const noOfDays = 7 * (approxDuration);
    await Subscription.updateEndDate(_subscription._id, startDate, noOfDays);

    res.json({success: true, metadata, orderId: order.id, subscriptionId: _subscription._id});
  } catch (err) {
    console.log(err)
    res.status(500).json({
      err: err.message
    });
  }
});


router.put('/:subsId/activate', async function (req, res, next) {
  try {
    const { subsId } = req.params;

    await Subscription.activateSubscription(subsId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/:subsId/deactivate', async function (req, res, next) {
  try {
    const { subsId } = req.params;

    await Subscription.deActivateSubscription(subsId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/updateTransaction', async function (req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const { status, notes } = await paymentModule.orders.fetch(razorpay_order_id);
    const completedOn = status === 'completed' ? Date.now() : null;
    const { subscriptionId } = notes;
    console.log("Activating subscription", subscriptionId);
    await Subscription.activateSubscription(subscriptionId);
    console.log("Updating transaction", razorpay_order_id);
    const transaction = await Transaction.update(
      razorpay_order_id,
      {
        orderId: razorpay_order_id,
        status,
        paymentId: razorpay_payment_id,
        paymentSignature: razorpay_signature,
        completedOn
      }
    )

    if (!transaction) {
      throw Error("Error updating transaction status")
    }

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/:subscriptionId/rollback', async function (req, res, next) {
  try {

    const completedOn = await DateUtils.getTimeZoneDate('IN');
    const { subscriptionId } = req.params;
    const { razorpay_order_id } = req.body;


    const slots = await Slot.findForSubs(subscriptionId);   
    
    const newSlots = [];
    let trainerId;

    if (slots && slots.length > 0) {
      await Utility.asyncForEach(slots, async slot => {
        trainerId = slot.trainerId;

        newSlots.push({
          time: slot.time,
          dayOfWeek: slot.dayOfWeek,
          duration: slot.duration,
          trainerId: slot.trainerId
        });

        const slotRemoved = await TrainerData.removeSlot(trainerId, slot._id);
        const slotsDeleted = await Slot.remove(slot._id);


        if (!slotsDeleted || !slotRemoved) {
          throw Error("Error in rollback");
        }
      });
      const insertedSlots = await Slot.insertAll(newSlots);
      await TrainerData.addSlots(trainerId, insertedSlots);
    }


    const transaction = await Transaction.update(
      razorpay_order_id, {
        status: "ROLLBACK",
        completedOn
      }
    )
    if (!transaction) {
      throw Error("Error updating transaction status")
    }

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;