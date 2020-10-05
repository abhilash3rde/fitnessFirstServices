const cuid = require('cuid');
const mongoose = require('mongoose');
const db = require('../config/db');
const couponCodeGenerator = require('coupon-code');
const {monthsFromNow} = require('../utility/utility');
const couponPrefix = 'GA-';
const couponConfig = {partLen: 6, parts: 1};
const transformer = (code) => couponPrefix + couponCodeGenerator.validate(code.replace(/^GA-/i, ''), couponConfig);

const couponSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid
  },
  trainerId: {
    type: String,
    ref: 'User',
    required: true,
    index: true
  },
  trainerData: {
    type: String,
    ref: 'User',
  },
  userId: {
    type: String,
    ref: 'User',
    default: null
  },
  couponCode: {
    type: String,
    default: () => couponPrefix + couponCodeGenerator.generate(couponConfig),
    index: true
  },
  percentageOff: {
    type: Number,
    required: true
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
  validTill: {
    type: Date,
    default: () => monthsFromNow()
  },
  redeemedOn: {
    type: Date,
    default: null
  },
  approved: {
    type: Boolean,
    default: false
  }
});

const Model = db.model('Coupon', couponSchema);

async function get(_id) {
  const model = await Model.findOne(
    {_id},
    {__v: 0}
  );
  return model;
}

async function getForUser(trainerId) {
  const model = await Model.find(
    {trainerId , approved : true},
    {__v: 0}
  ).sort({createdOn: -1});
  return model;
}
async function approveCoupon(_id) {
  try {
    const model = await Model.findOne(
      {_id},
      {__v: 0}
    );
    model.approved = true
    await model.save()
    return true;
  }
  catch {
    return false
  }
}
async function getForAdmin() {
  const model = await Model.find(
    {approved : false},
    {__v: 0}
  ).populate({ 
    path: 'TrainerId',
    model: 'TrainerData',
})
  .sort({createdOn: -1})
  .exec();
  return model;
}
async function create(fields) {
  const model = new Model(fields);
  await model.save();
  return model;
}

async function clone(model, times) {
  const models = [model];
  for (let i = 0; i < times; i++) {
    model._doc._id = cuid();
    model.isNew = true;
    await model.save();
    models.push(model);
  }
  return models;
}

async function redeem(couponCode, trainerId, userId) {
  const model = await Model.findOne({couponCode: transformer(couponCode), trainerId});
  model.userId = userId;
  model.redeemedOn = Date();
  await model.save();
  return {couponId: model._id, discount: model.percentageOff};
}

async function peek(couponCode, trainerId) {
  const model = await Model.findOne({couponCode: transformer(couponCode), trainerId, redeemedOn: null});
  return model.percentageOff;
}

module.exports = {
  get,
  create,
  approveCoupon,
  getForUser,
  getForAdmin,
  redeem,
  clone,
  peek,
  model: Model
}