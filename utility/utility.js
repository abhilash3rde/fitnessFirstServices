const bcrypt = require('bcrypt');
const fetch = require('node-fetch');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const {ENABLE_FILE_UPLOAD, CONTENT_TYPE, RANDOM_WALL_IMAGE, WEEK_DAYS_FULL_NAMES, cloudinaryConfig} = require('../constants');
const url = require('url');
const {admin, zoomConfig} = require('../config');
const jwt = require('jsonwebtoken');

cloudinary.config(cloudinaryConfig);
const SALT_ROUNDS = 10;

async function hashPassword(user) {
  if (!user.password) throw user.invalidate('password', 'password is required')
  if (user.password.length < 6) throw user.invalidate('password', 'password must be at least 6 characters')
  user.password = await bcrypt.hash(user.password, SALT_ROUNDS)
}

function emailUsername(emailAddress) {
  return emailAddress.split('@')[0]
}

const uploadLocalFile = async (path) => {
  const res = await cloudinary.uploader.upload(path, {resource_type: "auto"});
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
  } else {
    contentURL = 'https://res.cloudinary.com/matrim/image/upload/v1593552838/iavrrhcdjiwgdzqxzkf5.jpg';
  }

  return {contentURL, contentType};
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
  const randomNo = Math.floor(Math.random() * Object.keys(RANDOM_WALL_IMAGE).length);
  return RANDOM_WALL_IMAGE[randomNo];
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
      } else {
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

const sendNotification = async (tokens, message) => {
  await admin.messaging().sendToDevice(
    tokens,
    {
      data: {
        "priority": "high",
        "type": message.type,
        "content": message.text,
        "displayImage": message.displayImage || "",
        "sentDate": new Date().toString()
      }
    }
  );
}

async function getDayFullName(day) {
  let dayName = '';
  switch (day) {
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

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const monthsFromNow = (count = 3) => {
  const today = new Date();
  let parsedCount = parseInt(count);
  return new Date(today.setMonth(today.getMonth() + parsedCount));
}

function calculateBmi(weight, height) {
  weight = parseInt(weight);
  height = parseInt(height)
  if (weight > 0 && height > 0) {
    return (weight / (height / 100 * height / 100)).toPrecision(3)
  }
  return 0;
}

function getZoomToken() {
  const payload = {
    iss: zoomConfig.key,
    exp: ((new Date()).getTime() + 5000)
  };
  return jwt.sign(payload, zoomConfig.secret);
}

async function createZoomMeeting(title, date, duration) {
  const url = `${zoomConfig.baseUrl}/users/${zoomConfig.userId}/meetings`;
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getZoomToken()}`
  }
  const data = {
    start_time: date,
    duration,
    topic: title,
    settings: {
      host_video: true,
      approval_type: 0,
      mute_upon_entry: true,
      auto_recording: 'local', // or cloud,
      waiting_room: false,
    }
  }
  const res = await fetch(url, {method: 'POST', headers: headers, body: JSON.stringify(data)});
  return await res.json();
}

async function getZakToken() {
  const url = `${zoomConfig.baseUrl}/users/${zoomConfig.userId}/token?type=zak&ttl=36000`
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getZoomToken()}`
  }

  const res = await fetch(url, {method: 'GET', headers: headers});
  const {token} = await res.json();
  return token;
}

function appendMilitaryTime(date, militaryTime) {
  const dateObj = new Date(date);
  const time = militaryTime.toString();
  const hours = time.slice(0, 2);
  const minutes = time.slice(2);
  dateObj.setHours(parseInt(hours));
  dateObj.setMinutes(parseInt(minutes));
  dateObj.setSeconds(0);
  return dateObj;
}

module.exports = {
  hashPassword,
  emailUsername,
  uploadLocalFile,
  findMissingValue,
  uploadMedia,
  groupByTime,
  groupByDayAndTime,
  getRandomMedia,
  groupBy,
  sendNotification,
  getDayFullName,
  asyncForEach,
  monthsFromNow,
  calculateBmi,
  getZoomToken,
  createZoomMeeting,
  getZakToken,
  appendMilitaryTime,
}