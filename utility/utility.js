const bcrypt = require('bcrypt');
const fetch = require('node-fetch');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const {ENABLE_FILE_UPLOAD, CONTENT_TYPE, RANDOM_WALL_IMAGE, WEEK_DAYS_FULL_NAMES, cloudinaryConfig} = require('../constants');
const {admin, zoomConfig} = require('../config');
const jwt = require('jsonwebtoken');
const {edamamConfig} = require("../config");
const {agoraAppIds} = require("../constants");

cloudinary.config(cloudinaryConfig);
const SALT_ROUNDS = 10;

async function hashPassword(user) {
  if (!user.password) throw user.invalidate('password', 'password is required');
  if (user.password.length < 6) throw user.invalidate('password', 'password must be at least 6 characters');
  user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
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

function groupBy(datas, keys) {
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

const groupByKey = (objectArray, property) => {
  // coolest snippet i ever found, felt i should link source
  return objectArray.reduce((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    // Add object to list for given key's value
    acc[key].push(obj);
    return acc;
  }, {});
};

const sendNotification = async (tokens, message) => {
  console.log(tokens, '.........token')
  console.log(message, '.............msg')
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
      // auto_recording: 'local', // or cloud,
      auto_recording: 'none',
      waiting_room: false,
    }
  }
  const res = await fetch(url, {method: 'POST', headers: headers, body: JSON.stringify(data)});
  return await res.json();
}

// const a = async () => {
//   console.log(await createZoomMeeting());
// }
// a();

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
  const dateObj = date;
  const time = militaryTime.toString();
  const hours = time.slice(0, 2);
  const minutes = time.slice(2);
  dateObj.setHours(parseInt(hours));
  dateObj.setMinutes(parseInt(minutes));
  dateObj.setSeconds(0);
  dateObj.setMilliseconds(0);
  return dateObj;
}


const getHash = (str) => {
  let hash = 0, i, chr;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
let roundRobinIndex = 0;
const getAgoraAppId = () => {
  const appId = agoraAppIds[roundRobinIndex];
  console.log("Using agora app #", roundRobinIndex + 1);
  roundRobinIndex = (roundRobinIndex + 1) % agoraAppIds.length;
  return appId;
}

const getFoodData = async (foodName , qty) => {
  const url = `${edamamConfig.baseUrl}/nutrition-details?app_id=${edamamConfig.appId}&app_key=${edamamConfig.appKey}`;
  // "https://api.edamam.com/api/nutrition-details?app_id=3794d72a&app_key=97878e1f8b135ae65328bd7fbbcc0453";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "demo api",
      ingr: [qty ? `1 qty of ${foodName}` : `100 gram of ${foodName}`],
    }),
  });
  return await response.json();
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
  groupByKey,
  createZoomMeeting,
  getZakToken,
  appendMilitaryTime,
  getHash,
  getAgoraAppId,
  getFoodData
}