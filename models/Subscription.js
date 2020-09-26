const cuid = require('cuid');
const db = require('../config/db');

const DateUtils = require('../utility/DateUtils');
const Session = require("./Activity/Session");
const {sessionTypes} = require("../constants");
const {appendMilitaryTime} = require("../utility/utility");
const {WEEK_DAYS} = require("../constants");

const Model = db.model('Subscription', {
  _id: {
    type: String,
    default: cuid
  },
  packageId: {
    type: String,
    ref: 'Package',
    index: true,
    default: null
  },
  trainerId: {
    type: String,
    ref: 'TrainerData',
    index: true,
    default: null
  },
  subscribedBy: {
    type: String,
    ref: 'UserData',
    index: true,
    default: null
  },
  couponId: {
    type: String,
    ref: 'Coupon',
    default: null
  },
  active: {
    type: Boolean,
    default: false
  },
  // sessions: [{type: String, ref: 'Session'}],
  heldSessions: {
    type: Number,
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now()
  },
  endDate: {
    type: Date,
    default: null
  },
  days: [{type: String}],
  time: {type: String},
  duration: {type: Number},
  batchId: {
    type: String,
    ref: 'BatchSubscription',
    default: null
  }
});

async function get(_id) {
  const model = await Model.findOne(
    {_id},
    {__v: 0}
  ).populate('subscribedBy')
    .populate('packageId')
    .exec();
  return model;
}

async function remove(_id,) {
  const model = await get(_id);
  if (!model) throw new Error("Subscription not found");
  await Model.deleteOne({
    _id
  });
  return true;
}

async function create(fields) {
  console.log("Creating Subscription==>", fields);
  const model = new Model(fields);
  await model.save();
  return model;
}

async function edit(_id, change) {
  const model = await get(_id);
  if (!model) throw new Error("Subscription not found");

  Object.keys(change).forEach(key => {
    model[key] = change[key]
  });
  await model.save();
  return model;
}

async function activateSubscription(_id) {
  return await edit(_id, {active: true});
}

async function deActivateSubscription(_id) {
  return await edit(_id, {active: false});
}

async function getForPackage(packageId) {
  const model = await Model.findOne({packageId});
  return model;
}

async function getAllForTrainer(trainerId) {
  const model = await Model.find({trainerId}).populate([
    {path: 'subscribedBy'},
    {path: 'packageId'}
  ]).exec();
  return model;
}

async function getAllForUser(subscribedBy) {
  const model = await Model.find({subscribedBy}).populate([
    {path: 'trainerId'},
    {path: 'packageId'}
  ]).exec();
  return model;
}

async function updateEndDate(_id, startDate, noOfDays) {
  const model = await get(_id);

  const today = startDate ? new Date(startDate) : await DateUtils.getTimeZoneDate('IN');
  const endDate = new Date(today.setDate(today.getDate() + noOfDays));

  model['endDate'] = endDate;
  return await model.save();
}

async function createSessions(_id) {
  const model = await get(_id);
  const {startDate, days, time, duration, packageId, subscribedBy, batchId, trainerId} = model;
  const {noOfSessions} = packageId;
  const sessions = []; // create until amount reached
  const now =await DateUtils.getTimeZoneDate('IN');
  for (let date = new Date(startDate); sessions.length < noOfSessions; date.setDate(date.getDate() + 1)) {
    const day = date.getDay();

    if (days.includes(WEEK_DAYS[day])) {
      const sessionDate = appendMilitaryTime(date, time);
      if (sessionDate < now) continue;

      sessions.push({
        date: new Date(sessionDate.toUTCString()),
        userId: subscribedBy._id,
        packageId: packageId._id,
        subscriptionId: model._id,
        type: batchId ? sessionTypes.BATCH : sessionTypes.SINGLE,
        duration: duration,
        trainerId
      })
    }
  }
  const result = await Session.createMany(sessions);
}

module.exports = {
  get,
  create,
  edit,
  remove,
  activateSubscription,
  deActivateSubscription,
  getForPackage,
  getAllForTrainer,
  getAllForUser,
  updateEndDate,
  createSessions,
  model: Model
}