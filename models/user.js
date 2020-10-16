const {isEmail} = require('validator');

const db = require('../config/db');
const {hashPassword} = require("../utility/utility");

const {userTypes} = require("../constants")

const Model = db.model('User', {
  _id: {
    type: String,
  },
  email: emailSchema({
    required: true
  }),
  password: {
    type: String,
    maxLength: 120,
  },
  userType: {
    type: String,
    default: userTypes.USER,
    enum: [userTypes.USER, userTypes.TRAINER, userTypes.ADMIN],
    required: true
  }
})

async function get(email) {
  const model = await Model.findOne(
    {email},
    {__v: 0}
  );
  return model;
}
async function getAllusers() {
  const model = await Model.find(
    {}
  );
  return model;
}

async function getById(_id) {
  const model = await Model.findOne(
    {_id},
    {__v: 0}
  );
  return model;
}

async function remove(email) {
  await Model.deleteOne({
    email
  })
}

async function create(fields) {
  const existingModel = await getById(fields._id);
  if (existingModel) return existingModel;

  const model = new Model(fields);
  if(fields.password)
    await hashPassword(model);
  await model.save()
  return model;
}

async function setUserType(id, type) {
  const user = await getById(id);
  user.userType = type;
  await user.save();
  return true;
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
  create,
  getAllusers,
  remove,
  setUserType,
  model: Model
}