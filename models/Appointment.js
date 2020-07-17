const cuid = require('cuid');
const mongoose = require('mongoose');

const opts = { toJSON: { virtuals: true } };

const db = require('../config/db');
const post = require('./post');
const DateUtils = require('../utility/DateUtils');

const appointmentSchema = mongoose.Schema({
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
  createdOn: {
    type: Date,
    default: Date.now
  },
  dayOfWeek: {
    type: String,
    default: null
  },
  time: {
    type: String,
    default: null
  },
  notified: {
    type: Boolean,
    default: false
  },
  connected: {
    type: Boolean,
    default: false
  },
  appointmentDate: {
    type: Date,
    default: null
  }
}, opts);

const Model = db.model('Appointment', appointmentSchema);

async function get(_id) {
  const model = await Model.findOne(
    { _id },
    { __v: 0 }
  );
  return model;
}

async function findBooked(userId, trainerId, dayOfWeek) {
  const model = await Model.findOne(
    {
      userId,
      trainerId,
      dayOfWeek,
      connected: false
    },
    { __v: 0 }
  );

  if (model) {
    const today = new Date().getDate();
    const bookedDay = model['createdOn'].getDate();
    const appointmentDate = model['appointmentDate'].getDate();

    if (today - bookedDay < 7 || (appointmentDate - today > 0)) {
      return true;
    }
  }
  return false;
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

async function getTrainerAppointments(trainerId) {

  const now = await DateUtils.getTimeZoneDate("IN");
  let start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1, 0, 0);

  const model = await Model.find(
    { trainerId, appointmentDate: {
      $gte: start
    }},
    { __v: 0 }
  )
  .populate('userId')
  .sort({appointmentDate : -1})
  .exec();;
  return model;
}

async function getUserAppointments(userId) {

  const now = await DateUtils.getTimeZoneDate("IN");
  let start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1, 0, 0);

  const model = await Model.find(
    { userId, appointmentDate: {
      $gte: start
    }},
    { __v: 0 }
  )
  .populate('trainerId')
  .sort({appointmentDate : -1})
  .exec();;
  return model;
}

async function getTrainerAppointmentsForDate(trainerId, appointmentDate) {

  let start = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate(), 1, 0, 0);
  let end = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate() + 1, 0, 59, 59);

  const model = await Model.find(
    {
      trainerId, appointmentDate: {
        $gte: start,
        $lt: end
      }
    },
    { __v: 0 }
  ).populate('userId').exec();
  return model;
}

async function getuserAppointmentsForDate(userId, appointmentDate) {
  let start = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate(), 1, 0, 0);
  let end = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate() + 1, 0, 59, 59);

  const model = await Model.find(
    {
      userId, appointmentDate: {
        $gte: start,
        $lt: end
      }
    },
    { __v: 0 }
  ).populate('trainerId').exec();
  return model;
}

module.exports = {
  get,
  create,
  findBooked,
  updateConnected,
  getTrainerAppointments,
  getUserAppointments,
  getTrainerAppointmentsForDate,
  getuserAppointmentsForDate,
  model: Model
}