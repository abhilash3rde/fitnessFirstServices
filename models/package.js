const cuid = require('cuid');
const mongoose = require('mongoose');
const opts = {toJSON: {virtuals: true}};

const db = require('../config/db');
const Subscription = require('./Subscription');

const packageSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid
  },
  title: {
    type: String,
    default: 'Sample package'
  },
  category: {
    type: String,
    required: true
  },
  noOfSessions: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'INR'
  },
  active: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: "Add or create new packages, customise their duration and cost. Click to add or delete packages"
  },
  group: {
    type: Boolean,
    default: false
  },
  maxParticipants: {
    type: Number,
    default: 1
  },
  slot: {
    type: Object,
    default: null
  },
  startDate: {
    type: Date,
    default: Date.now
  }
}, opts);

packageSchema.virtual('totalSubscriptions', {
  ref: 'Subscription',
  localField: '_id',
  foreignField: 'packageId',
  count: true
  //match: { active: true } //TODO - revisit do we need only active ?
});


const Model = db.model('Package', packageSchema);

async function get(_id) {
  const model = await Model.findOne(
    {_id},
    {__v: 0}
  ).populate('totalSubscriptions');
  return model;
}

//Soft delete
async function remove(_id) {
  const model = await get(_id);
  if (!model) throw new Error("Package not found");

  if (model.totalSubscriptions > 0) {
    console.log("Setting model inactive", _id);
    model["active"] = false;
    await model.save();
  } else {
    console.log("Deleting model", _id);
    await Model.deleteOne({
      _id
    });
  }
  return true;
}

async function create(fields) {
  const model = new Model(fields);
  await model.save();
  return model;
}

async function edit(_id, change) {
  const model = await get(_id);
  if (!model) throw new Error("Package not found");

  if (model.totalSubscriptions > 0) {
    const newModel = await create(change);
    model["active"] = false;
    await model.save();
    return newModel;
  } else {
    Object.keys(change).forEach(key => {
      model[key] = change[key]
    });
    // console.log("model=>", model);
    await model.save();
    return model;
  }
}

async function checkForSubscription(packageId) {
  const subscription = await Subscription.getForPackage(packageId);
  // console.log('subs', subscription)
  return !!(subscription);
}

// async function addSubscription(packageId, subscriptionId) {
//   const model = await get(packageId);
//   model.subscriptions.push(subscriptionId);
//   await model.save();
//   return model;
// }

// async function removeSubscription(packageId, subscriptionId) {
//   const model = await get(packageId);
//   model.subscriptions = model.subscriptions.filter(subscription => subscription._id !== subscriptionId);
//   await Subscription.remove(subscriptionId);
//   await model.save();
//   return model;
// }

async function activatepackage(_id) {
  const model = await get(_id);
  model["active"] = false;
  return await model.save();
}

async function deActivatePackage(_id) {
  const model = await get(_id);
  model["active"] = true;
  return await model.save();
}


module.exports = {
  get,
  create,
  edit,
  remove,
  // addSubscription,
  // removeSubscription,
  activatepackage,
  deActivatePackage,
  model: Model
}