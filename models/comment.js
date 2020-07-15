const cuid = require('cuid');
const mongoose = require('mongoose');
const opts = { toJSON: { virtuals: true } };
const mongoosePaginate = require('mongoose-paginate');
const db = require('../config/db');

const Post = require('./post')

const commentSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid
  },
  commentedBy: {
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
  commentText: {
    type: String,
    required: true
  },
  postId: {
    type: String,
    ref: 'Post',
    required: true
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  spam: {
    type: Boolean,
    default: false
  },
  approved: {
    type: Boolean,
    default: true
  }
}, opts);

commentSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'contentId',
  count: true,
  match: { contentType: 'COMMENT' }
});

commentSchema.plugin(mongoosePaginate);
const Model = db.model('Comment', commentSchema);

async function get(_id) {
  const model = await Model.findOne(
    { _id },
    { __v: 0 }
  );
  return model;
}

async function remove(_id, userId) {
  const model = await get(_id);
  if (!model) throw new Error("Comment not found");

  if (model.commentedBy === userId) {
    await Model.deleteOne({
      _id
    });
    return true;
  }
  else throw new Error("Not authorised to delete comment");
}

async function deleteComments(postId) {
  const model = await Model.find({ postId });
  if (!model) throw new Error("Comment not found");

  try {
    //model.map(async comment=> await Model.deleteOne(comment._id));
    await Model.deleteMany({postId});
    return true;
  }
  catch(err){
    return false;
  }
}

async function create(fields) {
  const model = new Model(fields);
  await model.save();
  return model;
}

async function edit(_id, change) {
  const model = await get(_id);
  if (!model) throw new Error("Comment not found");

  Object.keys(change).forEach(key => {
    model[key] = change[key]
  });
  model['updatedOn'] = Date.now();
  await model.save();
  return await get(_id);
}


async function getForPosts(opts = {}, postId) {
  const {
    page = 1, limit = 25
  } = opts;

  let record = null;
  var options = {
    select: '',
    sort: { updatedOn: -1 },
    populate: [{path:'likes'}, {path:'commentedBy', select: '_id userType'}],
    lean: true,
    page: page,
    limit: limit
  };
  const query = {
    postId, spam:false, //approved:true -- just for testing 
  }

  await Model.paginate(query, options, async (err, result) =>{
    record = result;
  });
  return record;
}



module.exports = {
  get,
  create,
  edit,
  remove,
  deleteComments,
  getForPosts,
  model: Model
}