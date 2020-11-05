const express = require('express');
const router = express.Router();
const DateUtils = require('../utility/DateUtils')
const { userTypes, TIME_STRING, WEEK_DAYS } = require('../constants');
const Subscription = require('../models/Subscription');
const Slot = require('../models/slot');
const Posts = require('../models/post');
const Activities = require('./Activities')
const Logger = require('../services/logger_service')
let logg = new Logger('Activity')

router.get('/recent', async function (req, res, next) {
    try {
        const { userId, userType } = req;

        let upcomingActivities;
        logg.info('recent',{userId, userType})

        if (userType === userTypes.TRAINER) {
            upcomingActivities = await Activities.getTrainerActivities(userId);
        }
        else {
            upcomingActivities = await Activities.getUserActivities(userId);
        }

        let posts;
        const record = await Posts.list();
        if (record.docs.length > 0) {
            let nextPage;
            posts = record.docs;
            if (record.page < record.total) {
                nextPage = parseInt(record.page) + 1;
            }
        }
        res.json({ upcomingActivities, posts });

    } catch (err) {
        res.status(500).json({
            err: err.message
        });
    }
});

module.exports = router;