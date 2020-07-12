const cuid = require('cuid');
const mongoose = require('mongoose');

const opts = { toJSON: { virtuals: true } };

const db = require('../config/db');

const answerSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid
  },
  postedBy: {
    type: String,
    ref: 'User',
    required: true
  },
  answerText:{
    type: String,
    default: null
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
  updatedOn: {
    type: Date,
    default: Date.now
  },
  spam:{
    type: Boolean,
    default: false
  },
  approved:{
    type: Boolean,
    default: false
  }

}, opts);

answerSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'contentId',
  count: true,
  match: { contentType: 'ANSWER' }
});

const Model = db.model('Answer', answerSchema);

async function get(_id) {
  const model = await Model.findOne(
    { _id },
    { __v: 0 }
  ).populate({
    path:'answers',
    populate:{
      path:'likes'
    }
  }).exec();
  return model;
}

async function create(fields) {
  const model = new Model(fields);
  await model.save();
  return model;
}

async function edit(_id, change) {
  const model = await get(_id);
  if (!model) throw new Error("Question not found");

  Object.keys(change).forEach(key => {
    model[key] = change[key]
  });
  model['updatedOn'] = Date.now();
  await model.save();
  return await get(_id);
}



module.exports = {
  get,
  create,
  edit,
  model: Model
}