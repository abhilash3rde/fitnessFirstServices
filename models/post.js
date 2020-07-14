const cuid = require('cuid');
const mongoose = require('mongoose');
const db = require('../config/db');
const Comment = require('./comment');
const CONSTANTS = require('../constants/index');
const { CONTENT_TYPE } = require('../constants/index');
const mongoosePaginate = require('mongoose-paginate');

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
  comments: [{ type: String, ref: 'Comment', index:true}],
  shares: {
    type: Number,
    default: 0
  },
  spam:{
    type:Boolean,
    default: false
  },
  approved:{
    type:Boolean,
    default: true
  },
}, opts);

postSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'contentId',
  count: true,
  match:{contentType:'POST'}
});

postSchema.virtual('totalComments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'postId',
  count: true,
  match:{spam:false, approved: true}
});

postSchema.plugin(mongoosePaginate);
const Model = db.model('Post', postSchema);

async function get(_id) {
  const model = await Model.findOne(
    { _id },
    { __v: 0 }
  ).populate([{
    path:'totalComments'
  },
  {
    path:'likes'
  }]);
  return model;
}

async function list(opts = {}) {
  const {
    page = 1, limit = 25
  } = opts;

  let record = null;
  var options = {
    select: '',
    sort: { updatedOn: -1 },
    populate: [{path:'totalComments'}, {path: 'likes'}],
    lean: true,
    page: page,
    limit: limit
  };
  const query = {
    spam:false, approved: true
  }

  await Model.paginate(query, options, async (err, result) =>{
    record = result;
  });
  return record;
}

async function remove(_id, userId) {
  const model = await get(_id);
  if (!model) throw new Error("Post not found");
  if (model.createdBy !== userId) throw new Error("Not authorised to delete Post");
  
  const commentsRemoved = await Comment.deleteComments(model._id);

  if(commentsRemoved){
    await Model.deleteOne({
      _id
    });
    return true;
  }
  else{
    return false;
  } 
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
  
  model.comments = await model.comments.filter(async comment=> await comment.id !== commentId);

  await model.save();
  return model;
}

async function getMy(opts = {}, userId) {
  const {
    page = 1, limit = 25
  } = opts;

  let record = null;
  const options = {
    select: '',
    sort: { updatedOn: -1 },
    populate: [{path: 'totalComments'},{path: 'likes'}],
    lean: true,
    page: page,
    limit: limit
  };

  const query = {
    createdBy:userId, 
    spam:false, approved: true
  }

  await Model.paginate(query, options, async (err, result) =>{
    record = result;
  });
  return record;
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