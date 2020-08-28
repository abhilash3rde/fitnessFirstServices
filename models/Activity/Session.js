const mongoose = require('mongoose');
const cuid = require('cuid');

const db = require('../../config/db');
const {sessionTypes, sessionStatus} = require('../../constants');

const sessionSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid
  },
  date: {
    type: Date,
    required: true
  },
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  packageId: {
    type: String,
    ref: 'Package',
    required: true
  },
  subscriptionId: {
    type: String,
    ref: 'Subscription',
    required: true
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  type: {type: String, enum: [sessionTypes.BATCH, sessionTypes.SINGLE, sessionTypes.OFFLINE], required: true},
  data: {
    type: String,
    default: null
  },
  duration: {
    type: Number,
    default: 60
  },
  status: {
    type: String,
    enum: [sessionStatus.SCHEDULED, sessionStatus.LIVE, sessionStatus.FINISHED],
    default: sessionStatus.SCHEDULED
  }
});

const Model = db.model('Session', sessionSchema);

async function get(_id) {
  const model = await Model.findOne(
    {_id},
    {__v: 0}
  );
  return model;
}

async function remove(_id) {
  const model = await get(_id);
  if (!model) {
    return;
  }
  await Model.deleteOne({_id});
}

async function create(fields) {
  const model = new Model(fields);
  await model.save();
  return model;
}

async function createMany(sessions) {
  return Model.insertMany(sessions);
}

module.exports = {
  get,
  create,
  remove,
  createMany,
  model: Model
}