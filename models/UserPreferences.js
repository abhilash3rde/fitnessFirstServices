const cuid = require('cuid');
const mongoose = require('mongoose');
const db = require('../config/db');

const userPreferencesSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid
  },
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  preferences: [{
    type: String,
    default: ''
  }],
  exerciseIndex: {
    type: Number,
    default: 3
  },
  targetWeight: {
    type: Number
  },
  targetDate: {
    type: Date
  }
});

const Model = db.model('UserPreferences', userPreferencesSchema);

async function get(_id) {
  const model = await Model.findOne(
    {_id},
    {__v: 0}
  );
  return model;
}

async function getForUser(userId) {
  const model = await Model.findOne(
    {userId},
    {__v: 0}
  );
  return model;
}

async function createOrUpdate(fields) {
  const {userId, preferences} = fields;
  const existingModel = await getForUser(userId);
  if (existingModel) {
    existingModel.preferences = preferences;
    await existingModel.save();
    return existingModel;
  }
  const model = new Model(fields);
  await model.save();
  return model;
}

async function updateExerciseIndex(userId, index) {
  const model = await getForUser(userId);
  model.exerciseIndex = index;
  await model.save();
  return model;
}

async function updateTarget(userId, weight, date) {
  const model = await getForUser(userId);
  model.targetWeight = weight;
  model.targetDate = date;
  await model.save();
  return model;
}

module.exports = {
  get,
  createOrUpdate,
  getForUser,
  updateExerciseIndex,
  updateTarget,
  model: Model
}