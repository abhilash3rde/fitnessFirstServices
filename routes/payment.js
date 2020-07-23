const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const {monthsFromNow} = require('../utility/utility');

router.post('/generateCoupons', async function (req, res, next) {
  try {
    let {userId} = req;
    const {count = 1, percentageOff = 5, validity = 3} = req.body;

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
    res.json({discount});
  } catch (error) {
    res.status(500).json({error: error.toLocaleString()});
    console.log(error)
  }
});


module.exports = router;
