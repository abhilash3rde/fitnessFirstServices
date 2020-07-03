const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { ENABLE_FILE_UPLOAD, CONTENT_TYPE } = require('../constants');

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

const findMissingValue = (arr1, arr2, callback) =>{
  const set = new Set(arr2);
  callback(arr1.filter(t => !set.has(t)));    
}

async function uploadMedia(file){
  let contentURL = '';
  let contentType = CONTENT_TYPE.IMAGE;

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

    if (!slot[key1+'#'+key2]) {
      slot[key1+'#'+key2] = [];
    }
    slot[key1+'#'+key2].push(obj);
    return slot;
 }, {});
}

module.exports = {
  hashPassword,
  uploadLocalFile,
  findMissingValue,
  uploadMedia,
  groupByTime,
  groupByDayAndTime
}