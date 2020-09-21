const express = require('express');
const { compileClientWithDependenciesTracked } = require('jade');
const meetings = require('../models/meetings');
const router = express.Router();


router.post('/create', async function (req, res, next) {
  try {
    const { meetingNumber } = req.body;
  
    let end = new Date()
    end.setMinutes(00)
    end.setHours(new Date().getHours() + 1)
 
    const model = await meetings.create({
      meetingNumber: meetingNumber,   
      startTime : new Date(),
      endTime : end
    });
    res.json({success: true, meeting: model});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});


router.get('/showall', async function (req, res, next) {

    meetings.model.find().exec().then(meetings => {
        res.json({success: true,meetings: meetings});
        return meetings
    }).catch(err=>{
        console.log(err);
        res.status(500).json({
        err: err.message
        });
    })
});

router.put('/:id/end', async function (req, res, next) {
  try {
    const { id } = req.params;
    console.log(id)
    const result = await meetings.edit(
      id, { status: "FINISHED"  });
    if (result)
      res.json({
        success: true
      });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});


module.exports = router;


