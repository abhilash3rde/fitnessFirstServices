const express = require('express');
const router = express.Router();
const {claimStatus} = require('../constants');
const Coupon = require('../models/Coupon');
const BankAccount = require('../models/BankAccount');
const Subscription = require('../models/Subscription');
const Transaction = require('../models/Transaction');
const {monthsFromNow} = require('../utility/utility');

router.post('/generateCoupons', async function (req, res, next) {
  try {
    let {userId} = req;
    const {count = 1, percentageOff, validity = 3} = req.body;
    console.log(percentageOff)

    let coupon = await Coupon.create({
      trainerId: userId,
      percentageOff,
      approved: Math.random() > 0.5,
      validTill: monthsFromNow(validity)
    });
    let coupons = await Coupon.clone(coupon, count - 1);
    res.json({coupons, success: true});
  } catch (error) {
    res.status(500).json({error: error.toLocaleString()});
    console.log(error)
  }
});

router.get('/getCoupons', async function (req, res, next) {
  try {
    let {userId} = req;
    let coupons = await Coupon.getForUser(userId);
    res.json({coupons, success: true});
  } catch (error) {
    res.status(500).json({error: error.toLocaleString()});
    console.log(error)
  }
});

router.post('/getCouponDiscount', async function (req, res, next) {
  try {
    const {couponCode, trainerId} = req.body;
    let discount = await Coupon.peek(couponCode, trainerId);
    res.json(discount);
  } catch (error) {
    res.status(500).json({error: error.toLocaleString()});
    console.log(error)
  }
});

router.get('/accountSummary', async function (req, res, next) {
  try {
    const {userId} = req;
    const subscriptions = await Subscription.getAllForTrainer(userId);
    console.log(`found ${subscriptions.length} subs for trainer`);
    let totalEarnings = 0, claimedAmount = 0, claimableAmount = 0;
    let strippedSubs = await Promise.all(subscriptions.reverse().map(async subscription => {
      const {heldSessions, totalSessions, packageId, startDate, endDate, subscribedBy, _id: subscriptionId, couponId} = subscription;
      const transaction = await Transaction.getTransactionForSubscription(subscriptionId);
      if (!transaction || transaction.status !== 'paid') return null; // TODO: rollback these transactions

      let couponDetails = null;
      let finalPrice = packageId.price;
      if (couponId) {
        let {couponCode, percentageOff: discount} = await Coupon.get(couponId);
        finalPrice = packageId.price - (packageId.price * discount / 100);
        couponDetails = {couponCode, discount, finalPrice};
      }
      totalEarnings += finalPrice;
      if (transaction.claimStatus === claimStatus.DONE)
        claimedAmount += finalPrice;
      else if (transaction.claimStatus === claimStatus.NONE && heldSessions === totalSessions)
        claimableAmount += finalPrice;

      return {
        packageDetails: {
          packageTitle: packageId.title,
          startDate,
          endDate,
          sessionStatus: `(${heldSessions}/${totalSessions})`,
        },
        userDetails: {
          userName: subscribedBy.name,
          userCity: subscribedBy.city,
        },
        couponDetails,
        transactionDetails: {
          packagePrice: packageId.price,
          status: transaction.status,
          claimStatus: transaction.claimStatus,
          orderId: transaction.orderId,
          paymentDate: transaction.startedOn // not taking completed on as it can be null in case of pending payment
        },
      }
    }));
    // console.log('stripped', strippedSubs);
    strippedSubs = strippedSubs.filter(sub => sub);
    // console.log('after', strippedSubs);

    res.json({
      statements: strippedSubs,
      earnings: {
        totalEarnings,
        claimableAmount,
        claimedAmount
      }
    });
  } catch (error) {
    res.status(500).json({error: error.toLocaleString()});
    console.log(error)
  }
});

router.get('/getMyAccounts', async function (req, res, next) {
  try {
    let {userId} = req;
    let accounts = await BankAccount.getForUser(userId);
    res.json({accounts});
  } catch (error) {
    res.status(500).json({error: error.toLocaleString()});
    console.log(error);
  }
});

router.post('/addAccount', async function (req, res, next) {
  try {
    let {userId} = req;
    let account = await BankAccount.create(userId, req.body);
    res.json({account, success: true});
  } catch (error) {
    res.status(500).json({error: error.toLocaleString()});
    console.log(error);
  }
});


module.exports = router;
