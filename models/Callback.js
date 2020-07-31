const cuid = require('cuid');
const mongoose = require('mongoose');

const db = require('../config/db');
const {callbackStatus} = require('../constants');
const callbackSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid
  },
  userId: {
    type: String,
    ref: 'UserData',
    required: true
  },
  trainerId: {
    type: String,
    ref: 'TrainerData',
    required: true
  },
  status: {
    type: String,
    default: callbackStatus.REQUESTED
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
  acceptTime: {
    type: Date,
  },
});

const Model = db.model('Callback', callbackSchema);

async function get(_id) {
  const model = await Model.findOne(
    {_id},
    {__v: 0}
  );
  return model;
}

async function create(fields) {
  const model = new Model(fields);
  await model.save();
  return model;
}

async function updateConnected(_id) {
  const model = await get(_id);
  model['connected'] = true;
  await model.save();
  return await get(_id);
}

async function getTrainerCallbacks(trainerId) {
  const model = await Model.find(
    {trainerId, status:{ $ne: callbackStatus.REJECTED &&callbackStatus.COMPLETED }},
    {__v: 0}
  )
    .populate('userId')
    .sort({createdOn: -1})
    .exec();
  return model;
}

async function accept(callbackId) {
  const model = await get(callbackId);
  model.status = callbackStatus.ACCEPTED;
  await model.save();
}

async function reject(callbackId) {
  const model = await get(callbackId);
  model.status = callbackStatus.REJECTED;
  await model.save();
}
async function done(callbackId) {
  const model = await get(callbackId);
  model.status = callbackStatus.COMPLETED;
  await model.save();
}

async function checkPendingCall(userId, trainerId) {
  const model = await Model.findOne({userId, trainerId});
  if (!model) return false;
  return model.status !== callbackStatus.COMPLETED && model.status !== callbackStatus.REJECTED;
}

module.exports = {
  get,
  create,
  updateConnected,
  getTrainerCallbacks,
  accept,
  reject,
  done,
  checkPendingCall,
  model: Model
}