const cuid = require('cuid');
const mongoose = require('mongoose');

const opts = { toJSON: { virtuals: true } };

const db = require('../config/db');
const mongoosePaginate = require('mongoose-paginate');

const questionSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid
  },
  postedBy: {
    type: String,
    ref: 'User',
    required: true
  },
  questionText:{
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
  answers: [{
    type: String,
    ref: 'Answer',
    default: null
  }],
  spam:{
    type: Boolean,
    default: false
  },
  approved:{
    type: Boolean,
    default: false
  }

}, opts);

questionSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'contentId',
  count: true,
  match: { contentType: 'QUESTION' }
});

questionSchema.plugin(mongoosePaginate);
const Model = db.model('Question', questionSchema);

async function get(_id) {
  const model = await Model.findOne(
    { _id },
    { __v: 0 }
  ).populate('answers').exec();
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

async function addAnswer(_id, answerId) {
  const model = await get(_id);
  if (!model) throw new Error("Question not found");

  model.answers.push(answerId);
  await model.save();
  return await get(_id);
}

async function list(opts = {}) {
  const {
    page = 1, limit = 25
  } = opts;

  let record = null;
  var options = {
    select: '',
    sort: { updatedOn: -1 },
    populate: [
      {
        path:'answers',
        populate:[{
          path:'postedBy', select:'_id, userType'
        },{
          path:'likes'
        }]
    }, 
      {path: 'likes'},
    {
      path : 'postedBy', select:'_id, userType'
    }],
    lean: true,
    page: page,
    limit: limit
  };
  const query = {
    spam:false, //approved: true -- for test only
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
  addAnswer,
  list,
  model: Model
}