const mongoose = require('mongoose');
const db = require('../config/db');

const activeCallSchema = mongoose.Schema({
  _id: {
    type: String,
  },
  createdOn: {
    type: Date,
    default: Date.now
  }
});

const Model = db.model('ActiveCall', activeCallSchema);

async function get(_id) {
  const model = await Model.findOne(
    {_id},
    {__v: 0}
  );
  return model;
}

async function isBusy(_id) {
  const model = await Model.findOne(
    {_id},
    {__v: 0}
  );
  return !!model;
}

async function remove(_id) {
  const model = await get(_id);
  if (!model) {
    console.log("Tried to remove an active call that no longer exists, no op");
    return;
  }
  await Model.deleteOne({_id});
}

async function create(_id) {
  const existingModel = await get(_id);
  if (!existingModel) {
    const model = new Model({_id});
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