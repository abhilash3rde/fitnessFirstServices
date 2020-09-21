const cuid = require('cuid');
const mongoose = require('mongoose');
const db = require('../config/db');
const {streamStatus} = require('../constants');

const meetingsSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
   // default : end
  }, 

  meetingNumber: {
    type: Number
  },
  status: {
    type: String,
    default: streamStatus.SCHEDULED,
    enum: [streamStatus.SCHEDULED, streamStatus.FINISHED, streamStatus.LIVE]
  },
  
});

const Model = db.model('Meetings', meetingsSchema);


async function create(fields) {
  const model = new Model(fields);
  await model.save();
  return model;
}



async function list() {
  Model.find().exec().then(meetings => {
      console.log(meetings)
      return meetings
  }).catch(err=>{
      console.log(err)
  })
}

async function get(_id) {
    const model = await Model.findOne(
      { meetingNumber : _id },
      { __v: 0 }
    )
    .exec();
  
    return model;
  }

async function edit(_id, change) {

    const model = await get(_id);
    Object.keys(change).forEach(key => {
      model[key] = change[key]
    });
    console.log(model)
    await model.save();
    return await get(_id);
  }

module.exports = {
  create,
  list,
  edit,
  model: Model
}