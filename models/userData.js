// const cuid = require('cuid');
const {isEmail} = require('validator');
const mongoose = require('mongoose');

const db = require('../config/db');
const {userTypes} = require("../constants");
const opts = {toJSON: {virtuals: true}};

const userSchema = mongoose.Schema({
  _id: {
    type: String,
    required: true,
    // default: cuid
  },
  email: emailSchema({
    required: true
  }),
  userType: {type: String, default: userTypes.USER},
  name: {
    type: String,
    // required: true
  },
  city: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  phone: {
    type: String
  },
  gender: {
    type: String
  },
  displayPictureUrl: {
    type: String
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
}, opts);

userSchema.virtual('totalPosts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'createdBy',
  count: true
});

const Model = db.model('UserData', userSchema);

async function get(email) {
  const model = await Model.findOne(
    {email},
  ).populate('totalPosts').exec();
  return model;
}

async function getById(_id) {
  const model = await Model.findOne(
    {_id},
  ).populate('totalPosts').exec();
  return model;
}

async function list(opts = {}) {
  const {
    offset = 0, limit = 25
  } = opts;
  const model = await Model.find({}, {__v: 0})
  .populate('totalPosts')
    .sort({
      _id: 1
    })
    .skip(offset)
    .limit(limit)
  return model;
}

async function remove(email) {
  await Model.deleteOne({
    email
  })
}

async function create(fields) {
  if (fields._id) {
    const model = await getById(fields._id);
    if (model)
      return model;
  }
  const model = new Model(fields);
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

module.exports = {
  get,
  getById,
  list,
  create,
  edit,
  remove,
  model: Model
}