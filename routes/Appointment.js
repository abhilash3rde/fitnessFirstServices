const express = require('express');
const router = express.Router();

const Appointment = require('../models/Appointment');
const TrainerData = require('../models/trainerData');
const UserData = require('../models/userData');
const utility = require('../utility/utility');
const fcm = require('../models/fcm');
const WEEK_DAYS_FULL_NAMES = require('../constants');
const { userTypes } = require('../constants');


router.post('/:trainerId/book', async function (req, res, next) {
    try {
        const { userId } = req;
        const { trainerId } = req.params;

        const { day, time, appointmentDate } = req.body;

        let response = {
            success: false,
            message: "",
            appointment:{}
        }

        const trainerData = await TrainerData.getById(trainerId);
        const dayFullName = await utility.getDayFullName(day);

        const appointment = await Appointment.findBooked(userId, trainerId, day);
        if (appointment) {
            response['message'] = "You already have appointment booked with "+trainerData['name']+".";
        }
        else {
            const userData = await UserData.getById(userId);
            const token = await fcm.getToken(trainerId);            

            if (!token) throw new Error("Unable to get FCM token");

            const msgText = "Congratulations!! " + userData.name + " booked your appointment for " + dayFullName+".";
            const message = {
                type: "appointmentNotification",
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
                success : true,
                message : "Congratulations!! appointment booked with "+trainerData.name+" for "+ dayFullName+".",
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

router.put('/:appointmentId/connected', async function (req, res, next) {
    try {
        const { appointmentId } = req.params;

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
        const { userId, userType } = req;

        let appointments = [];

        if(userType === userTypes.TRAINER){
            const results = await Appointment.getTrainerAppointments(userId);
            appointments = [...results];
        }
        else{
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