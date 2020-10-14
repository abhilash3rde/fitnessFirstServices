const mongoose = require('mongoose');
const cuid = require('cuid');

const db = require('../../config/db');
const {groupByKey} = require("../../utility/utility");
const {groupBy} = require("../../utility/utility");
const {getRelativeDate} = require("../../utility/DateUtils");
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
    ref: 'UserData',
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
  trainerId: {
    type: String,
    ref: 'TrainerData'
  },
  startTime: {
    type: Date,
    default:null
  },
  endTime: {
    type: Date,
    default:null
  },
  joinTime: {
    type: Date,
    default:null
  },
  type: {type: String, enum: [sessionTypes.BATCH, sessionTypes.SINGLE, sessionTypes.OFFLINE], required: true},
  data: {
    type: Object,
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

async function getData(_id) {
  const model = await Model.findOne(
    {_id},
    {__v: 0}
  )
    .populate([
      {path: 'packageId'},
    ])
    .exec();
  ;
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

async function getForUser(userId, pastCount = -15, futureCount = 10) {
  const pastDate = getRelativeDate(pastCount);
  const futureDate = getRelativeDate(futureCount);
  return await Model.find({
    userId,
    date: {
      $gte: pastDate,
      $lte: futureDate
    },
  })
    .sort({date: 1})
    .populate([
      {path: 'trainerId', select: '_id displayPictureUrl name city'},
      {path: 'packageId'},
    ])
    .exec();
}

async function getForTrainer(trainerId, pastCount = -15, futureCount = 15) {
  const pastDate = getRelativeDate(pastCount);
  const futureDate = getRelativeDate(futureCount);
  const sessions = await Model.find({
    trainerId,
    date: {
      $gte: pastDate,
      $lte: futureDate
    }
  })
    .sort({date: 1})
    .populate([
      {path: 'userId', select: '_id displayPictureUrl name city'},
      {path: 'packageId'},
    ])
    .exec();
  const groupedSessions = groupByKey(sessions, 'date');
  const result = [];
  Object.values(groupedSessions).map(sessionArray => {
    let sessionObj = {...sessionArray[0]._doc};
    sessionObj.users = [];
    delete sessionObj.userId;
    sessionArray.map(session => sessionObj.users.push(session.userId));
    result.push(sessionObj);
  })
  return result;
}

async function setLive(sessionId, data) {
  const model = await get(sessionId);
  model.status = sessionStatus.LIVE;
  model.data = data;
  model.startTime = new Date();
  await model.save();
}

async function setFinished(sessionId) {
  const model = await get(sessionId);
  model.status = sessionStatus.FINISHED;
  model.endTime = new Date();
  await model.save();
}

async function join(sessionId) {
  const model = await get(sessionId);
  model.joinTime = new Date();
  await model.save();
}

async function getRelatedSessions(sessionId) {
  const model = await get(sessionId);
  const {trainerId, date} = model;
  return await Model.find({
    trainerId,
    date,
  }, '_id');
}

module.exports = {
  get,
  getData,
  create,
  join,
  remove,
  createMany,
  getForUser,
  getForTrainer,
  setLive,
  setFinished,
  getRelatedSessions,
  model: Model
}