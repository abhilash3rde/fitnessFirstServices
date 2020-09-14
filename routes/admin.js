const express = require('express');
const {admin} = require('../config');
const router = express.Router();
const jwt = require('jsonwebtoken');
var cors = require('cors');
const Certificate = require('../models/Certificate');
const Utility = require('../utility/utility');

const signJwt = require('../auth').sign;
const TrainerData = require('../models/trainerData');
const UserData = require('../models/userData');
const User = require('../models/user');
const Package = require('../models/package');
const Fcm = require('../models/fcm');

const {emailUsername} = require('../utility/utility');
// const {userTypes} = require("../constants")
const jwtSecret = process.env.JWT_SECRET || 'mark it zero'

const {userTypes} = require("../constants")
const jwtOpts = {
  algorithm: 'HS256',
  // expiresIn: '30d'
}

router.post('/loginweb',cors(), async function (req, res, next) {
  try {
    let {email,password,name} = req.body;
    console.log(req.body)
    // console.log('Auth req for ', userType);
    // let {name, picture, user_id, email} = await admin.auth().verifyIdToken(idToken);
    const ipInfo = req.ipInfo;
    const existingUser = await User.get(email);
    // const user = await User.findOne({email});
    // console.log(user)
    // console.log(existingUser)
    // console.log(email == existingUser.email && password == existingUser.password,existingUser.email,existingUser['password'])
    // const {email,userType,password} = req.body;
    if(existingUser){
        const authToken = await sign({
          userEmail:email,
          userType:existingUser.userType,
         password
        });
        res.json({
          success: true,
          authToken,
          type:existingUser.userType,
          email:email
        })

    }
    // else{
    //     res.status(403).json({
    //         err: "Wrong"
    //       });
    // }
      // userType = existingUser.userType; // Change userType if already existing
    // const Model = userType === userTypes.TRAINER ? TrainerData : UserData;

  
    // await Fcm.setFcmToken(user_id, fcmToken);
  } catch (err) {
    console.log(err);
    res.status(403).json({
      err: err.message
    });
  }
});
router.get('/trainers', async function (req, res, next) {
  try {
    const {userType} = req;
    let users;
    let record;
    let next;
    record = await TrainerData.list({page:1});      

    const pages = record.pages;
    if(record.page < pages){
       next = "/trainers/"+(parseInt(record.page) + 1);
    }
    else{
      next = null;
    }
    users = record.docs;

    res.json({trainers:users, next});
  } catch (err) {
    console.log(err)
    res.status(500).json({
      err: err.message
    });
  }
});
router.get('/trainer/:id', async function (req, res, next) {
  try {
    const {id}=req.params
    const {userType} = req;
    let users;
    let record;
    let next;
    record = await TrainerData.getById(id);      
// console.log(record,id)
    // users = record.docs;

    res.json({trainers:record, next});
  } catch (err) {
    console.log(err)
    res.status(500).json({
      err: err.message
    });
  }
});
async function sign(payload) {
  const token = await jwt.sign(payload, jwtSecret, jwtOpts);
  return token;
}

router.post('/certificate/:trainerid', async function (req, res, next) {
  try {
    const {trainerid} = req.params;
    const mediaFile = req.files ? req.files.mediaContent : null;
    const content = await Utility.uploadMedia(mediaFile);
    const {speciality} = req.body;
console.log(mediaFile,'-----------------')
    if (!content)
      throw new Error("Pdf upload failed");

    const contentUrl = content.contentURL;
    const certificate = await Certificate.create({
      trainerId: trainerid,
      contentUrl,
      speciality
    });
    const trainerData = await TrainerData.addCertificate(trainerid, certificate._id);

    res.json({certificate, trainerData});
  } catch (err) {
    console.log(err)
    res.status(500).json({
      err: err.message
    });
  }
});
module.exports = router;
