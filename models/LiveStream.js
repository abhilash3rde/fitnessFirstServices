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
  hostId: {
    type: String,
    ref: 'User',
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
  meetingId: {
    type: Number
  },
  meetingPassword: {
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
  if (Date(model.date) < Date.now()) {
    model.status = streamStatus.LIVE;
    await model.save();
    return true;
  } else return false;
}

async function list(opts = {}) {
  const {
    page = 1, limit = 25
  } = opts;

  let record = null;
  const options = {
    select: '',
    sort: {date: -1},
    lean: true,
    page: page,
    limit: limit
  };

  const query = {}

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
  model: Model
}