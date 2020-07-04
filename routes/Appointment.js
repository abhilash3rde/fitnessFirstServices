const express = require('express');
const router = express.Router();

const Appointment = require('../models/Appointment');
const TrainerData = require('../models/trainerData');
const UserData = require('../models/userData');
const utility = require('../utility/utility');
const fcm = require('../models/fcm');
const WEEK_DAYS_FULL_NAMES = require('../constants')


router.post('/:trainerId/book', async function (req, res, next) {
    try {
        const { userId } = req;
        const { trainerId } = req.params;

        const { day, time } = req.body;

        let respone = {
            success: false,
            message: ""
        }

        const trainerData = await TrainerData.getById(trainerId);

        const appointment = await Appointment.findForUser(userId, trainerId, day, time);
        if (appointment) {
            respone['message'] = "You already have appointment booked with "+trainerData.name+" for "+ utility.getDayFullName(day)+".";
        }
        else {
            const token = await fcm.getToken(trainerId);
            const userData = await UserData.getById(userId);

            if (!token) throw new Error("Unable to get FCM token");

            const msgText = "Congratulations!! " + userData.name + " booked your appointment for " + utility.getDayFullName(day);
            const message = {
                type: "appointmentNotification",
                text: msgText
            }

            console.log("Notifying Trainer for=>", message)
            await utility.sendNotification([token], message);

            const appointment = await Appointment.create({
                userId,
                trainerId,
                dayOfWeek: day,
                time,
                notified: true
            });
            if (!appointment) throw new Error("Error in booking appointment");

            respone = {
                success : true,
                message : "Congratulations!! appointment booked with "+trainerData.name+" for "+ utility.getDayFullName(day)+"."
            }
        }
        res.json(respone);
    } catch (err) {
        res.status(500).json({
            err: err.message
        });
    }
});

module.exports = router;