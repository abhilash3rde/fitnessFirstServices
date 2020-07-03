const cuid = require('cuid');

const db = require('../config/db');

const Model = db.model('Connection', {
  _id: {
    type: String,
    required: true //userId
  },
  socketId: {
    type: String,
    index: true,
    required: true,
  },
  creationTime: {
    type: Date,
    default: Date.now
  },
})

async function get(_id) {
  const model = await Model.findOne({_id});
  return model;
}

async function remove(socketId) {
  const model = await Model.findOne({socketId});
  if (!model) throw new Error("connection not found");
  await Model.deleteOne({socketId});
  return true;
}

async function create(fields) {
  const {userId, socketId} = fields;
  let model = await get(userId);
  if (model) {
    model.socketId = socketId;
    model.creationTime = Date.now();
  } else {
    model = new Model({
      _id: userId,
      socketId
    });
  }
  await model.save();
  return model;
}


module.exports = {
  get,
  create,
  remove,
  model: Model
}