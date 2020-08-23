const express = require('express');
const router = express.Router();

const TrainerData = require('../models/trainerData');
const Subscription = require('../models/Subscription');
const BatchSubscription = require('../models/BatchSubscription');
const Slot = require('../models/slot');
const Utility = require('../utility/utility');
const paymentModule = require('../config/payment');
const Transaction = require('../models/Transaction');
const DateUtils = require('../utility/DateUtils');
const Coupon = require('../models/Coupon');

router.post('/:trainerId/:packageId', async function (req, res, next) {
  try {
    const {userId} = req;
    const {trainerId, packageId} = req.params;

    const {time, days, startDate, couponCode} = req.body;

    if (!days || !days.length > 0) {
      throw new Error("Training days missing");
    }

    const trainerData = await TrainerData.getById(trainerId);
    const package = trainerData.packages.find(package => package._id === packageId);
    if (!package) {
      throw new Error("Invalid package");
    }
    let finalPrice = package.price;
    let coupon = null;
    if (!!couponCode) {
      let discount = await Coupon.peek(couponCode, trainerId);
      if (discount)
        coupon = (await Coupon.redeem(couponCode, trainerId)).couponId;
      finalPrice = finalPrice - (finalPrice * discount / 100);
    }

    const {group: isGroupPackage} = package;
    let availableSlots, availableDays;
    if (!isGroupPackage) {
      availableSlots = trainerData.slots.filter(slot => {
        if (!slot.subscriptionId && slot.time === time && days.includes(slot.dayOfWeek)) {
          return true;
        }
      });

      availableDays = availableSlots.flatMap(availableSlot => availableSlot.dayOfWeek);
      Utility.findMissingValue(days, availableDays, day => {
        if (day.length > 0) {
          throw new Error("Slot not available for " + day + " at " + time);
        }
      });
    }

    const _subscription = await Subscription.create({
      packageId,
      trainerId,
      subscribedBy: userId,
      totalSessions: package.noOfSessions,
      startDate,
      couponId: coupon
    });
    const approxDuration = package.noOfSessions / days.length;
    const noOfDays = 7 * (approxDuration);
    await Subscription.updateEndDate(_subscription._id, startDate, noOfDays);

    if (!isGroupPackage) {
      availableSlots.map(async slot => {
        await Slot.edit(slot._id, {
          subscriptionId: _subscription._id
        })
      });
    }else {
      let batchSubscription = await BatchSubscription.getForPackage(packageId);
      if(!batchSubscription){
        //Create new batch
        batchSubscription = await BatchSubscription.create({
          packageId,
          trainerId,
          totalSessions: package.noOfSessions,
          startDate,
        });
        await BatchSubscription.updateEndDate(batchSubscription._id, startDate,noOfDays);
      }
      await BatchSubscription.addSubscription(batchSubscription._id, _subscription._id);
    }

    if (finalPrice === 0) {
      await Subscription.activateSubscription(_subscription._id);
      await Transaction.create({
        orderId: _subscription._id,
        subscriptionId: _subscription._id,
        transferAttempts: 0,
        status: 'paid'
      });
      res.json({success: true, payment: false});
      return;
    }
    const metadata = {
      packageName: package.title,
      sessionCount: package.noOfSessions,
      price: finalPrice,
      time,
      days,
      approxDuration,
      subscriptionId: _subscription._id,
      trainerName: trainerData.name
    };
    const options = {
      amount: 100 * parseInt(finalPrice),  // amount in the smallest currency unit
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
    const {subsId} = req.params;

    await Subscription.activateSubscription(subsId);
    res.json({success: true});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/:subsId/deactivate', async function (req, res, next) {
  try {
    const {subsId} = req.params;

    await Subscription.deActivateSubscription(subsId);
    res.json({success: true});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/updateTransaction', async function (req, res, next) {
  try {
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;

    const {status, notes} = await paymentModule.orders.fetch(razorpay_order_id);
    const completedOn = status === 'completed' ? Date.now() : null;
    const {subscriptionId} = notes;
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

    res.json({success: true});
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
    const {subscriptionId} = req.params;
    const {razorpay_order_id} = req.body;


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

    res.json({success: true});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;