const cuid = require('cuid');
const db = require('../config/db');

const DateUtils = require('../utility/DateUtils');

const Model = db.model('BatchSubscription', {
  _id: {
    type: String,
    default: cuid
  },
  packageId: {
    type: String,
    ref: 'Package',
    index: true,
    default: null
  },
  trainerId: {
    type: String,
    ref: 'TrainerData',
    index: true,
    default: null
  },
  subscriptions: [{
    type: String,
    ref: 'Subscription',
    index: true,
    default: null
  }],
  active: {
    type: Boolean,
    default: true
  },
  heldSessions: {
    type: Number,
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
});

async function get(_id) {
  const model = await Model.findOne(
    {_id},
    {__v: 0}
  ).populate('subscribedBy')
    .exec();
  return model;
}

async function remove(_id,) {
  const model = await get(_id);
  if (!model) throw new Error("BatchSubscription not found");
  await Model.deleteOne({
    _id
  });
  return true;
}

async function create(fields) {
  console.log("Creating BatchSubscription==>", fields);
  const model = new Model(fields);
  await model.save();
  return model;
}

async function edit(_id, change) {
  const model = await get(_id);
  if (!model) throw new Error("BatchSubscription not found");

  Object.keys(change).forEach(key => {
    model[key] = change[key]
  });
  await model.save();
  return model;
}

async function activateSubscription(_id) {
  return await edit(_id, {active: true});
}

async function deActivateSubscription(_id) {
  return await edit(_id, {active: false});
}

async function getForPackage(packageId) {
  const model = await Model.findOne({packageId});
  return model;
}

async function getAllForTrainer(trainerId) {
  const model = await Model.find({trainerId}).populate([
    {path: 'subscriptions'},
    {path: 'packageId'}
  ]).exec();
  return model;
}

async function updateEndDate(_id, startDate, noOfDays) {
  const model = await get(_id);

  const today = startDate ? new Date(startDate) : await DateUtils.getTimeZoneDate('IN');
  const endDate = new Date(today.setDate(today.getDate() + noOfDays));

  model['endDate'] = endDate;
  return await model.save();

}

async function addSubscription(batchId, subscriptionId) {
  const model = await get(batchId);
  model.subscriptions.push(subscriptionId);
  await model.save();
  return model;
}

module.exports = {
  get,
  create,
  edit,
  remove,
  activateSubscription,
  deActivateSubscription,
  getForPackage,
  getAllForTrainer,
  updateEndDate,
  addSubscription,
  model: Model
}