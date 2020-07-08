const Razorpay = require('razorpay');
const {paymentKey} = require('../constants');

const instance = new Razorpay({
  key_id: paymentKey.key_id,
  key_secret: paymentKey.key_secret,
})

module.exports = instance