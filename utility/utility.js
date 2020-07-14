const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { ENABLE_FILE_UPLOAD, CONTENT_TYPE, RAMDOM_WALL_IMAGE, WEEK_DAYS_FULL_NAMES } = require('../constants');
const url = require('url');
const {admin} = require('../config');


const SALT_ROUNDS = 10;
async function hashPassword(user) {
  if (!user.password) throw user.invalidate('password', 'password is required')
  if (user.password.length < 6) throw user.invalidate('password', 'password must be at least 6 characters')
  user.password = await bcrypt.hash(user.password, SALT_ROUNDS)
}



const uploadLocalFile = async (path) => {
  const res = await cloudinary.uploader.upload(path);
  fs.unlinkSync(path);
  if (res && res.secure_url) {
    console.log('file uploaded to Cloudinary', res.secure_url);
  } else {
    return '';
  }
  return res.secure_url;
}

const findMissingValue = (arr1, arr2, callback) => {
  const set = new Set(arr2);
  callback(arr1.filter(t => !set.has(t)));
}

async function uploadMedia(file) {
  let contentURL = '';
  let contentType = CONTENT_TYPE.TEXT;

  if (ENABLE_FILE_UPLOAD) {
    if (file && file.tempFilePath) {
      contentURL = await uploadLocalFile(file.tempFilePath);

      if (!contentURL) {
        throw new Error("Media upload failed");
      }
      contentType = file.mimetype.toUpperCase().indexOf("IMAGE") > -1 ? CONTENT_TYPE.IMAGE : CONTENT_TYPE.VIDEO;
    }
  }
  else {
    contentURL = 'https://res.cloudinary.com/matrim/image/upload/v1593552838/iavrrhcdjiwgdzqxzkf5.jpg';
  }

  return { contentURL, contentType };
}

async function groupByTime(slots) {
  return slots.reduce((slot, obj) => {
    const key = obj['time'];

    if (!slot[key]) {
      slot[key] = [];
    }
    slot[key].push(obj);
    return slot;
  }, {});
}

//ToDo - revisit to make is generic solution
async function groupByDayAndTime(slots) {
  return slots.reduce((slot, obj) => {
    const key1 = obj['dayOfWeek'];
    const key2 = obj['time'];

    if (!slot[key1 + '#' + key2]) {
      slot[key1 + '#' + key2] = [];
    }
    slot[key1 + '#' + key2].push(obj);
    return slot;
  }, {});
}


async function getRandomMedia() {  
  const randomNo = Math.floor(Math.random() * Object.keys(RAMDOM_WALL_IMAGE).length);
  return RAMDOM_WALL_IMAGE[randomNo];
}

async function groupBy(datas, keys) {
  return datas.reduce((data, obj) => {
    const KEYS = [];
    if (KEYS.length === 0) {
      if (keys instanceof Array) {
        for (let key of keys) {
          const value = obj[key];
          KEYS.push(value);
        }
      }
      else {
        KEYS.push(keys);
      }
      iterate = false;
    }

    const KEY = KEYS.join('#');

    if (!data[KEY]) {
      data[KEY] = [];
    }
    data[KEY].push(obj);
    return data;
  }, {});
}

const sendNotification = async (tokens, message) =>{
  await admin.messaging().sendToDevice(
    tokens,
    {
      data: {
        "priority": "high",
        "type": message.type,
        "content": message.text
      }
    }
  );
}

async function getDayFullName(day){
  let dayName = '';
  switch(day){
    case "MON":
    dayName = WEEK_DAYS_FULL_NAMES.MON;
    break;    
    case "TUE":
    dayName = WEEK_DAYS_FULL_NAMES.TUE;
    break;
    case "WED":
    dayName = WEEK_DAYS_FULL_NAMES.THU;
    break;
    case "THU":
    dayName = WEEK_DAYS_FULL_NAMES.WED;
    break;
    case "FRI":
    dayName = WEEK_DAYS_FULL_NAMES.FRI;
    break;
    case "SAT":
    dayName = WEEK_DAYS_FULL_NAMES.SAT;
    break;
    case "SUN":
    dayName = WEEK_DAYS_FULL_NAMES.SUN;
    break;
  }
  return dayName;
}

module.exports = {
  hashPassword,
  uploadLocalFile,
  findMissingValue,
  uploadMedia,
  groupByTime,
  groupByDayAndTime,
  getRandomMedia,
  groupBy,
  sendNotification,
  getDayFullName
}