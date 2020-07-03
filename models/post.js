const cuid = require('cuid');
const mongoose = require('mongoose');
const db = require('../config/db');
const Comment = require('./comment');
const CONSTANTS = require('../constants/index');
const { CONTENT_TYPE } = require('../constants/index');

const opts = { toJSON: { virtuals: true } };

const postSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid
  },
  createdBy: {
    type: String,
    ref: 'User',
    required: true
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
  updatedOn: {
    type: Date,
    default: Date.now
  },
  contentType: {
    type: String,
    default: CONTENT_TYPE.TEXT,
    enum: [CONTENT_TYPE.IMAGE, CONTENT_TYPE.VIDEO]
  },
  textContent: {
    type: String,
    default: null
  },
  contentURL: {
    type: String,
    default: null
  },
  comments: [{ type: String, ref: 'Comment', index: true }],
  shares: {
    type: Number,
    default: 0
  }
}, opts);

postSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'postId',
  count: true
});


const Model = db.model('Post', postSchema);

async function get(_id) {
  const model = await Model.findOne(
    { _id },
    { __v: 0 }
  ).populate('comments').exec();
  return model;
}

async function list(opts = {}) {
  const {
    offset = 0, limit = 25
  } = opts;
  const model = await Model.find({}, { __v: 0 })
    .sort({ updatedOn: -1 })
    .skip(offset)
    .limit(limit)
    .populate('comments').exec();
  return model;
}

async function remove(_id, userId) {
  const model = await get(_id);
  if (!model) throw new Error("Post not found");
  if (model.createdBy !== userId) throw new Error("Not authorised to delete Post");

  model.comments.map(comment => Comment.remove(comment._id, userId)); // Delete associated comments

  await Model.deleteOne({
    _id
  });
  return true;
}

async function create(fields) {
  const model = new Model(fields);
  await model.save();
  return await get(model._id);
}

async function edit(_id, change) {

  const model = await get(_id);
  Object.keys(change).forEach(key => {
    model[key] = change[key]
  });
  model['updatedOn'] = Date.now();
  await model.save();
  return await get(_id);
}

async function addComment(postId, commentId) {
  const model = await get(postId);
  model.comments.push(commentId);
  await model.save();
  return await get(model._id);
}

async function removeComment(postId, commentId) {
  const model = await get(postId);
  model.comments.filter(comment=> comment._id !== commentId);
  await model.save();
  return await get(model._id);
}

async function getMy(options) {

  const {
    offset = 0, limit = 25, userId
  } = options;

  const model = await Model.find({createdBy: userId},
    { __v: 0 }
  )
  .sort({
    updatedOn: -1
  })
  .skip(offset)
  .limit(limit)
  .populate([
    {
    path:'comments',
    populate:{
      path:'likes'
    }
  },{
    path: 'likes'
  }
]).exec();
  return model;
}

module.exports = {
  get,
  list,
  create,
  edit,
  remove,
  addComment,
  removeComment,
  getMy,
  model: Model
}