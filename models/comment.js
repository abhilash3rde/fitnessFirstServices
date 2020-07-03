const cuid = require('cuid');
const mongoose = require('mongoose');
const opts = {toJSON: {virtuals: true}};

const db = require('../config/db');
const post = require('./post');

const commentSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid
  },
  commentedBy:{
    type:String,
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
  commentText: {
    type: String,
    required: true
  },
  postId:{
    type: String,
    ref: 'Post',
    required: true
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
}, opts);

commentSchema.virtual('likes',{
  ref: 'Like',
  localField: '_id',
  foreignField: 'commentId',
  count: true
});


const Model = db.model('Comment', commentSchema);

async function get(_id) {
  const model = await Model.findOne(
    {_id},
    {__v: 0}
  );
  return model;
}

async function remove(_id, userId) {
  const model = await get(_id);
  const postId = model['postId'];
  if(!model) throw new Error("Comment not found");
  if (model.commentedBy === userId){
    await Model.deleteOne({
      _id
    });
    return postId;
  }
  else throw new Error("Not authorised to delete comment");
}

async function create(fields) {
  const model = new Model(fields);
  await model.save();
  return model;
}

async function edit(_id, userId, commentText) {
  const model = await get(_id);
  if(!model) throw new Error("Comment not found");
  if (model.commentedBy !== userId) throw new Error("Not authorised to edit comment");

  model.commentText = commentText;
  model.isEdited = true;
  model.updatedOn = Date.now();
  await model.save();
  return model;
}

module.exports = {
  get,
  create,
  edit,
  remove,
  model: Model
}