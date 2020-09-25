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
  await model.save().then(()=>{
    console.log("Meeting save")
  }).catch((err)=>{
    console.log("error while saving meeting")
    console.log(err)
  })
 
}



async function list() {
  Model.find().exec().then(meetings => {
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

// async function edit(_id, change) {

//     const model = await get(_id);
//     Object.keys(change).forEach(key => {
//       model[key] = change[key]
//     });
//     console.log(model,change,'change')
//     await model.save();
//     return await get(_id);
//   }
async function edit(meetingNumber) {
  if(meetingNumber){
    const model = await Model.findOne({meetingNumber});
    if (!model) console.log("steam not found");
     else{
      model.status = streamStatus.FINISHED;
      console.log("Setting meeting FINISHED");
      await model.save();
    }
  }
  }

module.exports = {
  create,
  list,
  edit,
  model: Model
}