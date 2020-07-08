const mongoose = require('mongoose');
const db = require('../config/db');

const activeCallSchema = mongoose.Schema({
  userId: {
    type: String,
  },
  createdOn: {
    type: Date,
    default: Date.now
  }
});

const Model = db.model('ActiveCall', activeCallSchema);

async function get(userId) {
  const model = await Model.findOne(
    {userId},
    {__v: 0}
  );
  return model;
}

async function isBusy(userId) {
  const model = await Model.findOne(
    {userId},
    {__v: 0}
  );
  return !!model;
}

async function remove(userId) {
  const model = await get(userId);
  if (!model) {
    console.log("Tried to remove an active call that no longer exists, no op");
    return;
  }
  await Model.deleteOne({userId});
}

async function create(userId) {
  const existingModel = await get(userId);
  if (!existingModel) {
    const model = new Model({userId});
    await model.save();
    return model;
  } else return existingModel;
}

module.exports = {
  get,
  create,
  remove,
  isBusy,
  model: Model
}