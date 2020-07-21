const cuid = require('cuid');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const db = require('../config/db');

const bmiSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid
  },
  date: {
    type: Date,
    default: Date.now
  },
  userId:{
    type:String,
    ref:'User'
  },
  bmi:{
    type:Number,
    required:true
  },
  weight:{
    type:Number,
    required:true
  },
  difference:{
    type:Number,
    default:0
  }
});
bmiSchema.plugin(mongoosePaginate);
const Model = db.model('BmiHistory', bmiSchema);

async function get(_id) {
  const model = await Model.findOne(
    { _id },
    { __v: 0 }
  );
  return model;
}

async function create(fields) {
  let latest = await Model.findOne({}, {}, { sort: { 'date' : -1 } } );
  let difference = 0;
  if(latest) difference = fields.weight - latest.weight;
  const model = new Model({...fields, difference:difference.toPrecision(2)});
  await model.save();
  return model;
}

async function getHistory(userId, opts={}) {
  const {
    page = 1, limit = 250
  } = opts;

  let record = null;
  const options = {
    select: '',
    sort: { date: -1 },
    lean: true,
    page: page,
    limit: limit
  };

  const query = {
    userId
  }

  await Model.paginate(query, options, async (err, result) =>{
    record = result;
  });
  return record;
}

module.exports = {
  get,
  create,
  getHistory,
  model: Model
}