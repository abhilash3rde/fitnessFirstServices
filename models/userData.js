// const cuid = require('cuid');
const {isEmail} = require('validator');
const mongoose = require('mongoose');

const db = require('../config/db');
const {userTypes} = require("../constants");
const utility = require('../utility/utility')
const opts = {toJSON: {virtuals: true}};
const mongoosePaginate = require('mongoose-paginate');

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
    default: 'User'
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
    type: String,
    default:''
  },
  wallImageUrl: {
    type: String,
    default:''
  },
  dateJoined:{
    type:Date,
    default:Date.now
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

userSchema.plugin(mongoosePaginate);
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
    page = 1, limit = 10
  } = opts;

  let record = null;
  var options = {
    select: '',
    sort: { rating: 1, experience: 1 },
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
    if (model)
      return model;
  }
  const model = new Model(fields);
  if(model['wallImageUrl'] === ''){
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