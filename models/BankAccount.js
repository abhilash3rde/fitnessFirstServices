const cuid = require('cuid');
const mongoose = require('mongoose');
const db = require('../config/db');

const bankAccountSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid
  },
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  holderName: {
    type: String,
    required: true
  },
  BankName: {
    type: String,
    default: ''
  },
  accountNumber: {
    type: String,
    required: true
  },
  ifscCode: {
    type: String,
    required: true
  },
});

const Model = db.model('BankAccount', bankAccountSchema);

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

async function create(fields) {
  //TODO correct this
  const {userId} = fields;
  const existingModel = await getForUser(userId);
  if (existingModel) {
    update(userId, fields);
  }
  const model = new Model(fields);
  await model.save();
  return model;
}

async function update(userId, keys) {
  const model = await getForUser(userId);
  Object.keys(keys).forEach(key => {
    model[key] = keys[key]
  });
  await model.save();
  return model;
}

module.exports = {
  get,
  create,
  getForUser,
  update,
  model: Model
}