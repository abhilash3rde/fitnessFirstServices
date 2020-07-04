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

async function create(fields) {
  const model = new Model(fields);
  await model.save();
  return model;
}

module.exports = {
  get,
  create,
  model: Model
}