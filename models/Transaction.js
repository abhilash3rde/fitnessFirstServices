const cuid = require('cuid');
const mongoose = require('mongoose');
const {claimStatus} = require('../constants');
const opts = {toJSON: {virtuals: true}};

const db = require('../config/db');

const transactionSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid
  },
  orderId: {
    type: String,
    default: null
  },
  subscriptionId: {
    type: String,
    default: null
  },
  startedOn: {
    type: Date,
    default: Date.now
  },
  completedOn: {
    type: Date,
    default: null
  },
  transactionAttempts: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: false
  },
  paymentId: {
    type: String,
    default: null
  },
  paymentSignature: {
    type: String,
    default: null
  },
  claimStatus: {
    type: String,
    default: claimStatus.NONE
  }
}, opts);

const Model = db.model('Transaction', transactionSchema);

async function get(_id) {
  const model = await Model.findOne(
    {_id},
    {__v: 0}
  );
  return model;
}

async function getTransactionForOrder(orderId) {
  const model = await Model.findOne(
    {orderId},
    {__v: 0}
  );
  return model;
}

async function getTransactionForSubscription(subscriptionId) {
  const model = await Model.findOne(
    {subscriptionId},
    {__v: 0}
  );
  return model;
}


async function create(fields) {
  const model = new Model(fields);
  await model.save();
  return await get(model._id);
}

async function update(orderId, keys) {
  const model = await getTransactionForOrder(orderId);
  Object.keys(keys).forEach(key => {
    model[key] = keys[key]
  });
  await model.save();
  return model;
}

async function updateStatus(orderId, status) {
  const model = await getTransactionForOrder(orderId);
  model['status'] = status;
  await model.save();
  return model;
}

async function updateClaimStatus(orderId, status) {
  const model = await getTransactionForOrder(orderId);
  model.claimStatus = status;
  await model.save();
  return model;
}

module.exports = {
  get,
  create,
  getTransactionForOrder,
  getTransactionForSubscription,
  updateStatus,
  updateClaimStatus,
  update,
  model: Model
}