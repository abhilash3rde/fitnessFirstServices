const cuid = require('cuid');
const mongoose = require('mongoose');
const db = require('../config/db');
const opts = {toJSON: {virtuals: true}};
const Logger = require('../services/logger_service')
let logg = new Logger('subscription')
const slotSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid
  },
  time: {
    type: String,
    default: '0600' // military time
  },
  dayOfWeek: {
    type: String,
    default: 'MON'
  },
  duration: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  subscriptionId: {
    type: String,
    ref: 'Subscription',
    index: true,
    default: null
  },
  group: {
    type: Boolean,
    default: false
  },
  packageId: {
    type: String,
    ref: 'Package',
    default: null
  },
  batchId: {
    type: String,
    ref: 'BatchSubscription',
    index: true,
    default: null
  },
  trainerId: {
    type: String,
    ref: 'TrainerData',
    index: true,
    default: null
  }
}, opts);

slotSchema.virtual('isSubscribed').get(function () {
  return !!this.subscriptionId || !!this.batchId;
});

const Model = db.model('Slot', slotSchema);


async function get(_id) {
  const model = await Model.findOne(
    {_id},
    {__v: 0}
  ).populate({
    path: 'subscriptionId',
    populate: {
      path: 'subscribedBy'
    }
  }).exec()
  return model;
}

async function findForDayAndTime(dayOfWeek, time) {
  const model = await Model.findOne(
    {dayOfWeek, time},
    {__v: 0}
  );
  return model;
}

async function remove(_id) {
  const model = await get(_id);
  if (!model) throw new Error("Slot not found");

  if (!model.subscriptionId) {
    await Model.deleteOne({
      _id
    });
    return true;
  } else {
    if (model.subscriptionId.active !== true) {
      await Model.deleteOne({
        _id
      });
      return true;
    }
  }
  return false;
}

async function create(fields) {
  const model = new Model(fields);
  await model.save();
  return model;
}

async function edit(_id, change) {
  const model = await get(_id);
  if (!model) throw new Error("Slot not found");

  if (model.subscriptionId) {
    throw Error("Slot has active subscription");
  }
    logg.info('slotedit',change)
  Object.keys(change).forEach(key => {
    model[key] = change[key]
  });
  await model.save();
  return model;
}

async function findAvailableSlots(object) {
  return await Model.find({
    trainerId: object.trainerId,
    dayOfWeek: {$in: object.days},
    time: object.time
  });
}
async function getBookedSlots(trainerId) {
  return await Model.find({
    trainerId: trainerId,
  });
}

async function updateAll(allSlots) {
  const slots = await Model.updateMany(allSlots);
  return slots;
}

async function deleteAll(condition) {
  const criteria = {};
  Object.keys(condition).forEach(key => {
    criteria[key] = condition[key]
  });

  // console.log("criteria", criteria)

  const slots = await Model.deleteMany({...criteria});
  return slots;
}

async function insertAll(allSlots) {
  return Model.insertMany(allSlots);
}

async function updateForDayTime(dayOfWeek, time, change) {
  const model = await findForDayAndTime(dayOfWeek, time);
  Object.keys(change).forEach(key => {
    model[key] = change[key]
  });
  return await model.save();
}

async function getAllAvailableSlots() {

  const {
    offset = 0, limit = 500
  } = opts;
  const model = await Model.find(
    {subscriptionId: null, active: true},
    {time: 1, dayOfWeek: 1, duration: 1, trainerId: 1})
    .sort({
      time: 1
    })
    .skip(offset)
    .limit(limit);
  return model;
}

async function getAllToNotify(dayOfWeek, time) {
  // console.log("dayOfWeek", dayOfWeek)
  const model = await Model.find({
    dayOfWeek,
    time,
    subscriptionId: {$ne: null},
    active: true,
    notified: false
  });
  return model;
}

async function findForSubsAndDay(subscriptionId, dayOfWeek) {
  const model = await Model.findOne(
    {subscriptionId, dayOfWeek},
    {time: 1, dayOfWeek: 1}
  );
  return model;
}

async function findForSubs(subscriptionId) {
  const model = await Model.find(
    {subscriptionId}
  );
  return model;
}

async function getDayAndTime(criteria) {
  let result;
  await Model.aggregate(
    [{'$match': {...criteria}},
      {
        '$group': {
          '_id': '$time',
          daysOfWeek: {$addToSet: "$dayOfWeek"}
        }
      },
    ], (err, docs) => {
      if (err)
        console.log(err);
      else {
        result = docs;
      }
    }
  );
  return result;
}


async function findForPackage(packageId) {
  return await Model.find(
    {packageId}
  );
}


module.exports = {
  get,
  create,
  edit,
  remove,
  insertAll,
  updateAll,
  findAvailableSlots,
  getBookedSlots,
  findForDayAndTime,
  updateForDayTime,
  getAllAvailableSlots,
  getAllToNotify,
  findForSubsAndDay,
  findForSubs,
  deleteAll,
  getDayAndTime,
  findForPackage,
  model: Model
}