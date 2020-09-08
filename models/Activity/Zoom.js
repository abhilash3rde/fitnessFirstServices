const mongoose = require('mongoose');
const cuid = require('cuid');

const db = require('../../config/db');

const zoomCallSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid
  },
  clientKey: {
    type: String,
    required: true
  },
  clientSecret: {
    type: String,
    required: true
  },
  meetingNumber: {
    type: Number,
    required: true
  },
  meetingPassword: {
    type: String,
    required: true
  },
  // userId: {
  //   type: String,
  //   required: true
  // },
  parentSessionId: {
    type: String,
    required: true
  }
});

const Model = db.model('ZoomCall', zoomCallSchema);

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

module.exports = {
  get,
  create,
  remove,
  model: Model
}