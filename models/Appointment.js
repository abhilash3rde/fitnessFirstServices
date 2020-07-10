const cuid = require('cuid');
const mongoose = require('mongoose');

const opts = {toJSON: {virtuals: true}};

const db = require('../config/db');
const post = require('./post');

const appointmentSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid
  },
  userId:{
    type:String,
    ref: 'UserData',
    required: true
  },
  trainerId:{
    type:String,
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
    default:null
  },
  notified:{
    type: Boolean,
    default:false
  },
  connected:{
    type: Boolean,
    default:false
  },
  appointmentDate:{
    type:Date,
    default:null
  }
}, opts);

const Model = db.model('Appointment', appointmentSchema);

async function get(_id) {
  const model = await Model.findOne(
    {_id},
    {__v: 0}
  );
  return model;
}

async function findBooked(userId, trainerId, dayOfWeek) {
    const model = await Model.findOne(
      {
          userId,
          trainerId,
          dayOfWeek,
          connected:false
      },
      {__v: 0}
    );

    if(model){
      const today = new Date().getDate();
      const bookedDay = model['createdOn'].getDate();
      const appointmentDate = model['appointmentDate'].getDate();

      if(today - bookedDay < 7 || (appointmentDate - today > 0)){
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
  const model = await Model.find(
    {trainerId},
    {__v: 0}
  ).populate('userId').exec();;
  return model;
}

async function getUserAppointments(userId) {
  const model = await Model.find(
    {userId},
    {__v: 0}
  ).populate('trainerId').exec();;
  return model;
}

async function getTrainerAppointmentsForDate(trainerId, appointmentDate) {
  const model = await Model.find(
    {trainerId, appointmentDate},
    {__v: 0}
  ).populate('userId').exec();
  return model;
}

async function getuserAppointmentsForDate(userId, appointmentDate) {
  const model = await Model.find(
    {userId, appointmentDate},
    {__v: 0}
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