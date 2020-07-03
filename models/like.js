const cuid = require('cuid');
const db = require('../config/db');

const Model = db.model('Like', {
    _id: {
        type: String,
        default: cuid
    },
    likedBy: {
        type: String,
        ref: 'User',
        required: true
    },
    likedOn: {
        type: Date,
        default: Date.now
    },
    postId: {
        type: String,
        ref: 'Post',
        default:null
    },
    commentId: {
        type: String,
        ref: 'Comment',
        default:null
    }
});

async function get(_id) {
    const model = await Model.findOne(
        { _id },
        { __v: 0 }
    );
    return model;
}

async function create(fields) {
    const model = new Model(fields);
    await model.save();
    return await get(model._id);
  }

  async function remove(_id,) {
    const model = await get(_id);
    if (!model) throw new Error("No Likes");

  
    await Model.deleteOne({
      _id
    });
    return true;
  }

  async function unlikeComment(commentId) {
    const model = await Model.findOne({commentId});

    if(!model){
        throw Error("No Like");
    }
    return await remove(model._id);
  }

  async function unlikePost(postId) {
    const model = await Model.findOne({postId});
    if(!model){
        throw Error("No Like");
    }
    return await remove(model._id);
  }

module.exports = {
    get,
    create,
    unlikeComment,
    unlikePost,
    model: Model
}