const express = require('express');
const router = express.Router();
const BmiHistory = require('../models/BmiHistory');
const UserData = require('../models/userData');

router.post('/recordBmi', async function (req, res, next) {
  try {
    const {userId} = req;
    const {bmi, weight} = req.body;
    await UserData.edit(userId, {weight});
    const record = await BmiHistory.create({
      bmi,
      weight,
      userId
    });
    res.json({success: true, record});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

router.get('/getBmiHistory', async function (req, res, next) {
  try {
    const {userId} = req;
    const records = await BmiHistory.getHistory(userId);
    res.json({success: true, records:records.docs});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});


module.exports = router;


