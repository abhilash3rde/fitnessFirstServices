const express = require('express');
const router = express.Router();
const utility = require('../utility/utility');

const paymentModule = require('../config/payment');

router.get('/', async function (req, res, next) {
  try {
    //testing
    // let {userId} = req.params;
    // if(!userId) userId = req.userId;
    const options = {
      amount: 50000,  // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11",
      payment_capture: '0'
    };
    const order = await paymentModule.orders.create(options);
    res.json({'message': order});
  } catch (error) {
    res.status(500).json({error: error.toLocaleString()});
    console.log(error)
  }
});


module.exports = router;
