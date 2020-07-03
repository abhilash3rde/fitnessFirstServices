const db = require('../config/db');

const Model = db.model('Fcm', {
  userId: {
    type: String,
    required: true
  },
  fcmToken: {
    type: String,
    required: true
  }
})

async function get(userId) {
  const model = await Model.findOne({userId});
  return model;
}

async function getToken(userId) {
  const {fcmToken} = await Model.findOne(
    {userId},
    {__v: 0}
  );
  if(!fcmToken) throw new Error('FCM token not found for user', userId);
  return fcmToken;
}

async function removeToken(userId) {
  const model = await get(userId);
  if (!model) throw new Error("FCM entry not found");
  await Model.deleteOne({userId});
  return true;
}

async function setFcmToken(userId, fcmToken) {
  let model = await get(userId);
  if (model) {
    model.fcmToken = fcmToken;
  } else {
    model = new Model({
      userId,
      fcmToken
    });
  }
  await model.save();
  return model;
}


module.exports = {
  getToken,
  setFcmToken,
  removeToken,
  model: Model
}