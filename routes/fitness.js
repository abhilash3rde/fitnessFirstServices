const express = require('express');
const router = express.Router();
const BmiHistory = require('../models/BmiHistory');
const UserData = require('../models/userData');
const UserPreferences = require('../models/UserPreferences');

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
    res.json({success: true, records: records.docs});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/preferences', async function (req, res, next) {
  try {
    // Overwrites old preferences, basically create/update
    const {userId} = req;
    const {preferences} = req.body;
    const record = await UserPreferences.createOrUpdate({
      userId,
      preferences
    });
    res.json({success: true, preferences: record.preferences});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

router.get('/preferences', async function (req, res, next) {
  try {
    const {userId} = req;
    const {preferences, exerciseIndex} = await UserPreferences.getForUser(userId);
    res.json({preferences, exerciseIndex});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

router.post('/preferences/exerciseIndex/:index', async function (req, res, next) {
  try {
    const {userId} = req;
    const {index} = req.params;
    await UserPreferences.updateExerciseIndex(userId, index);
    res.json({success: true});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;


