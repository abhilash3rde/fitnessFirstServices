const cuid = require('cuid');
const db = require('../config/db');

const Model = db.model('termsConsent', {
  _id: {
    type: String,
    default: cuid
  },
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  acceptedOn: {
    type: Date,
    default: Date.now
  },
});

async function get(userId) {
  const model = await Model.findOne(
    {userId},
    {__v: 0}
  );
  return model;
}

async function create(userId) {
  const model = new Model({userId});
  await model.save();
  return model;
}

module.exports = {
  get,
  create,
  model: Model
}