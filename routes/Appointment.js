const express = require('express');
const router = express.Router();

const Appointment = require('../models/Appointment');
const TrainerData = require('../models/trainerData');
const UserData = require('../models/userData');
const utility = require('../utility/utility');
const fcm = require('../models/fcm');
const WEEK_DAYS_FULL_NAMES = require('../constants');
const {userTypes, WEEK_DAYS, remoteMessageTypes} = require('../constants');
const DateUtils = require('../utility/DateUtils');


router.post('/:trainerId/book', async function (req, res, next) {
  try {
    const {userId} = req;
    const {trainerId} = req.params;

    const {day, time} = req.body;

    let appointmentDate = req.body.appointmentDate;

    let response = {
      success: false,
      message: "",
      appointment: {}
    }

    if (!appointmentDate) {
      appointmentDate = await DateUtils.getDateBasedOnDay(WEEK_DAYS.indexOf(day));
    }

    const trainerData = await TrainerData.getById(trainerId);
    const dayFullName = await utility.getDayFullName(day);

    const appointment = await Appointment.findBooked(userId, trainerId, day);
    if (appointment) {
      response['message'] = "You have already requested a call back with " + trainerData['name'] + ".";
    } else {
      const userData = await UserData.getById(userId);
      const token = await fcm.getToken(trainerId);

      if (!token) throw new Error("Unable to get FCM token");

      const msgText = userData.name + " requested a call back on" + dayFullName + ".";
      const message = {
        type: remoteMessageTypes.APPOINTMENT,
        text: msgText
      }

      console.log("Notifying Trainer for=>", message);
      await utility.sendNotification([token], message);

      const appointment = await Appointment.create({
        userId,
        trainerId,
        dayOfWeek: day,
        time,
        appointmentDate,
        notified: true
      });
      if (!appointment) throw new Error("Error in booking appointment");

      response = {
        success: true,
        message: "Call back requested with " + trainerData.name + " on " + dayFullName + ".",
        appointment
      }
    }
    res.json(response);
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});


router.put('/:appointmentId/accept', async function (req, res, next) {
  try {
    const {appointmentId} = req.params;
    await Appointment.accept(appointmentId);
    res.json({success: true});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});
router.put('/:appointmentId/reject', async function (req, res, next) {
  try {
    const {appointmentId} = req.params;
    await Appointment.reject(appointmentId);
    res.json({success: true});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/:appointmentId/connected', async function (req, res, next) {
  try {
    const {appointmentId} = req.params;

    const appointment = await Appointment.updateConnected(appointmentId);
    if (!appointment) {
      throw Error("Unable to update appointment")
    }
    res.json(appointment);
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.get('/myAppointments', async function (req, res, next) {
  try {
    const {userId, userType} = req;

    let appointments = [];

    if (userType === userTypes.TRAINER) {
      const results = await Appointment.getTrainerAppointments(userId);
      appointments = [...results];
    } else {
      const results = await Appointment.getUserAppointments(userId);
      appointments = [...results];
    }
    res.json(appointments);
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;