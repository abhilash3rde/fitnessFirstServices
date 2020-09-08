const cuid = require('cuid');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const {streamStatus} = require('../constants');
const db = require('../config/db');

const liveStreamSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid
  },
  date: {
    type: Date,
    default: Date.now
  },
  host: {
    type: String,
    ref: 'TrainerData',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 60
  },
  status: {
    type: String,
    default: streamStatus.SCHEDULED,
    enum: [streamStatus.SCHEDULED, streamStatus.FINISHED, streamStatus.LIVE]
  },
  meetingNumber: {
    type: Number
  },
  meetingPassword: {
    type: String
  },
  clientKey: {
    type: String
  },
  clientSecret: {
    type: String
  }
});
liveStreamSchema.plugin(mongoosePaginate);
const Model = db.model('LiveStream', liveStreamSchema);

async function get(_id) {
  const model = await Model.findOne(
    {_id},
    {__v: 0}
  );
  return model;
}

async function create(fields) {
  const model = new Model(fields);
  await model.save();
  return model;
}

async function setLive(streamId) {
  const model = await get(streamId);

  if (new Date(model.date) < new Date) {
    model.status = streamStatus.LIVE;
    console.log("Setting stream live");
    await model.save();
    return true;
  } else return false;
}

async function setFinished(meetingNumber) {
  const model = await Model.findOne({meetingNumber});
  if (!model) return false;
  model.status = streamStatus.FINISHED;
  console.log("Setting stream FINISHED");
  await model.save();
  return true;
}

async function list(opts = {}, hostId = null) {
  const {
    page = 1, limit = 25
  } = opts;

  let record = null;
  const options = {
    select: '',
    sort: {date: -1},
    populate: [{path: 'host', select: '_id displayPictureUrl name city'}],
    lean: true,
    page: page,
    limit: limit
  };

  const query = hostId ? {host: hostId} : {};

  await Model.paginate(query, options, async (err, result) => {
    record = result;
  });
  return record;
}

module.exports = {
  get,
  create,
  list,
  setLive,
  setFinished,
  model: Model
}