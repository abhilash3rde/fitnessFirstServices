const mongoose = require('mongoose');
const { isEmail } = require('validator');

const db = require('../config/db');
const { userTypes } = require("../constants")

const Package = require('./package');
const Slot = require('./slot');
const utility = require('../utility/utility');
const mongoosePaginate = require('mongoose-paginate');

const opts = { toJSON: { virtuals: true } };

const trainerSchema = mongoose.Schema({
  _id: {
    type: String,
    required: true
    // default: cuid
  },
  email: emailSchema({
    required: true
  }),
  userType: { type: String, default: userTypes.TRAINER }, // helpful for frontend
  name: {
    type: String,
    default: 'Trainer'
  },
  experience: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 4.0
  },
  // workingDays: {
  //   type: Array,
  //   default: []
  // },
  slots: [{ type: String, ref: 'Slot' }],
  packages: [{ type: String, ref: 'Package' }],
  phone: {
    type: String
  },
  gender: {
    type: String
  },
  displayPictureUrl: {
    type: String,
    default: ''
  },
  wallImageUrl: {
    type: String,
    default: ''
  },
  dateJoined: {
    type: Date,
    default: Date.now
  },
  city: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  bmi: {
    type: Number
  },
  weight: {
    type: Number
  },
  height: {
    type: Number
  },
  chest: {
    type: Number
  },
  biceps: {
    type: Number
  },
  approved:{
    type: Boolean,
    default: false
  }
}, opts);

trainerSchema.virtual('totalSlots', {
  ref: 'Slot',
  localField: '_id',
  foreignField: 'trainerId',
  count: true
});

trainerSchema.virtual('availableSlots', {
  ref: 'Slot',
  localField: '_id',
  foreignField: 'trainerId',
  count: true,
  match: { active: true, subscriptionId: null }
});

trainerSchema.virtual('totalPosts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'createdBy',
  count: true
});

trainerSchema.plugin(mongoosePaginate);
const Model = db.model('TrainerData', trainerSchema);

async function get(email) {
  const model = await Model.findOne(
    { email },
  )
    .populate([{
      path: 'packages',
      populate: {
        path: 'totalSubscriptions'
      }
    }, {
      path: 'slots',
      populate: {
        path: 'subscriptionId',
        populate: {
          path: 'subscribedBy'
        }
      }
    }, { path: 'totalPosts' }
    ])
    .exec();

  return model;
}

async function getById(_id) {
  const model = await Model.findOne(
    { _id },
  ).populate({
    path: 'packages',
    populate: {
      path: 'totalSubscriptions'
    }
  })
    .populate([{
      path: 'packages',
      populate: {
        path: 'totalSubscriptions'
      }
    }, {
      path: 'slots',
      populate: {
        path: 'subscriptionId',
        populate: {
          path: 'subscribedBy'
        }
      }
    }, { path: 'totalPosts' }])
    .exec();

  return model;
}

async function list(opts = {}) {
  const {
    page = 1, limit = 10
  } = opts;

  let record = null;
  var options = {
    select: '',
    sort: { rating: -1, experience: -1 },
    populate: [{
      path: 'packages',
      populate: {
        path: 'totalSubscriptions'
      }
    }, {
      path: 'slots',
      populate: {
        path: 'subscriptionId',
        populate: {
          path: 'subscribedBy'
        }
      }
    }, { path: 'totalPosts' },{ path: 'totalSlots' }, { path: 'availableSlots' }],
    lean: true,
    page: page,
    limit: limit
  };

  await Model.paginate({}, options, async (err, result) =>{
    record = result;
  });
  return record;
}

async function remove(email) {
  await Model.deleteOne({
    email
  })
}

async function create(fields) {
  if (fields._id) {
    const model = await getById(fields._id);
    if (model) {
      return model;
    }
  }
  const model = new Model(fields);
  if (model['wallImageUrl'] === '') {
    model['wallImageUrl'] = await utility.getRandomMedia();
  }
  await model.save()
  return model;
}

async function edit(userId, change) {
  const model = await getById(userId);
  Object.keys(change).forEach(key => {
    model[key] = change[key]
  });
  await model.save();
  return model;
}

async function addPackage(trainerId, packageId) {
  const model = await getById(trainerId);
  console.log('mod', model);
  model.packages.push(packageId);
  await model.save();
  return model;
}

async function addSlot(trainerId, slotId) {
  const model = await getById(trainerId);
  model.slots.push(slotId);
  await model.save();
  return model;
}

async function removePackage(trainerId, packageId) {
  const model = await getById(trainerId);
  model.packages = model.packages.filter(package_ => package_._id !== packageId);
  await Package.remove(packageId);
  await model.save();
  return model;
}

async function removeSlot(trainerId, slotId) {
  const model = await getById(trainerId);

  for(var i =0; i < model.slots.length; i++){
    if(slotId === model.slots[i]._id){
      model.slots.splice(i, 1);
      i--;
    }
  }
  
  await model.save();
  return model;
}

async function removeSlots(trainerId, slots) {
  const model = await getById(trainerId);

  for(var i =0; i < model.slots.length; i++){
    if(slots.includes(model.slots[i]._id)){
      model.slots.splice(i, 1);
      i--;
    }
  }
  await model.save();
  return model;
}

function emailSchema(opts = {}) {
  const {
    required
  } = opts
  return {
    type: String,
    required: !!required,
    unique: true,
    lowercase: true,
    validate: [{
      validator: isEmail,
      message: props => `${props.value} is not a valid email address`
    },
    {
      validator: function (email) {
        return isUnique(this, email)
      },
      message: props => 'Email already in use'
    }
    ]
  }
}

async function isUnique(doc, property) {
  const existing = await get(property);
  return !existing || doc._id === existing._id;
}

async function addSlots(trainerId, slotIds) {
  const model = await getById(trainerId);
  model.slots.push(...slotIds);
  await model.save();
  return getById(model);
}

async function addWorkingDays(trainerId, workingDays) {
  const model = await getById(trainerId);
  model.workingDays.push(...workingDays);
  await model.save();
  return getById(model);
}

async function getTrainer(_id) {
  const model = await Model.findOne(
    { _id },
    { name:1, experience:1, rating:1, displayPictureUrl:1, wallImageUrl:1, city:1 }
  );

  const { name, experience, rating, displayPictureUrl, wallImageUrl, city } = model;

  return { name, experience, rating, displayPictureUrl, wallImageUrl, city };
}


module.exports = {
  get,
  getById,
  list,
  create,
  edit,
  remove,
  addPackage,
  addSlot,
  addSlots,
  removePackage,
  removeSlot,
  addWorkingDays,
  getTrainer,
  removeSlots,
  model: Model
}