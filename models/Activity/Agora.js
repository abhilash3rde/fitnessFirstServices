const mongoose = require('mongoose');
const cuid = require('cuid');

const db = require('../../config/db');

const agoraCallSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid
  },
  appId: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  parentSessionId: {
    type: String,
    required: true
  }
});

const Model = db.model('AgoraCall', agoraCallSchema);

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

async function getParentSessionId(sessionId) {
  const model = await Model.findOne({sessionId});
  if(!model){
    return null;
  }
  return model.parentSessionId;
}

module.exports = {
  get,
  create,
  remove,
  getParentSessionId,
  model: Model
}