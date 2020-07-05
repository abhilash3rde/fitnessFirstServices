const express = require('express');
const router = express.Router();
const {userTypes} =  require("../constants");
const TrainerData = require('../models/trainerData');
const UserData = require('../models/userData');

router.get('/', async function (req, res, next) {
    try {
      const {userType} = req;    
      const {users, nextPage} = await getPageUsers(userType, 1);
  
      res.json({users, nextPage});
    } catch (err) {
      console.log(err)
      res.status(500).json({
        err: err.message
      });
    }
  });
  
  router.get('/:page', async function (req, res, next) {
    try {
      const {userType} = req;
      const {page} = req.params;
  
      const {users, nextPage} = await getPageUsers(userType, page);
  
      res.json({users, nextPage});
    } catch (err) {
      console.log(err)
      res.status(500).json({
        err: err.message
      });
    }
  });
  
  const getPageUsers = async (userType, page)=>{
    let record;
    let nextPage;
    if(userType===userTypes.USER)
      {
        record = await TrainerData.list({page});      
      }
      else{
        record = await UserData.list({page});
      } 
      const pages = record.pages;
      if(page < pages){
        nextPage = "/users/"+(parseInt(record.page) + 1);
      }
      else{
        nextPage = null;
      }
      users = record.docs;
  
      return {users, nextPage};
  }

  module.exports = router;