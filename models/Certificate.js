const cuid = require('cuid');

const db = require('../config/db');
const {MODELS} = require('./index');
const Model = db.model(MODELS.Certificate, {
  _id: {
    type: String,
    default:cuid
  },
  trainerId: {
    type: String,
    ref: MODELS.TrainerData,
    required: true,
  },
  contentUrl: {
    type: String,
    required: true
  },
  speciality: {
    type: String,
  }
})

async function get(_id) {
  const model = await Model.findOne({_id});
  return model;
}

async function remove(_id) {
  await Model.deleteOne({_id});
  return true;
}

async function create(fields) {
  const model = new Model(fields);
  await model.save();
  return model;
}

module.exports = {
  get,
  create,
  remove,
  model: Model
}