const express = require('express');
const router = express.Router();
const DateUtils = require('../utility/DateUtils')
const { userTypes, TIME_STRING, WEEK_DAYS } = require('../constants');
const Subscription = require('../models/Subscription');
const Slot = require('../models/slot');
const Posts = require('../models/post');


router.get('/recent', async function (req, res, next) {
    try {
        const { userId, userType } = req;
        const date = await DateUtils.getTimeZoneDate("IN");
        const day = WEEK_DAYS[date.getDay()];
        const nextDay = WEEK_DAYS[date.getDay() + 1];
        const time = TIME_STRING[date.getHours()];

        console.log("Getting sessions for =>", TIME_STRING[date.getHours()]);
        console.log("Getting sessions for =>", WEEK_DAYS[date.getDay()]);

        const todaySessions = [];
        const nextDaySessions = [];

        if (userType === userTypes.TRAINER) {
            const mySubscribers = await Subscription.getAllForTrainer(userId);
            console.log("mySubscribers=>", mySubscribers);
            if(mySubscribers && mySubscribers.length > 0){
                await asyncForEach(mySubscribers, async subscriber => {
                    const slot = await Slot.findForSubsAndDay(subscriber._id, day);
                    if (parseInt(slot.time) > parseInt(time)) {
                        todaySessions.push({
                            time: slot.subscribedBy.time,
                            name: subscriber.subscribedBy.name,
                            day:'Today',
                            displayPictureUrl: subscriber.subscribedBy.displayPictureUrl,
                            sessionsLeft: (subscriber.totalSessions - subscriber.heldSessions)
                        });
                    }
    
                    const slotsNextDay = await Slot.findForSubsAndDay(subscriber._id, nextDay);
                    nextDaySessions.push({
                        time: slotsNextDay.time,
                        day:slotsNextDay.dayOfWeek,
                        name: subscriber.subscribedBy.name,
                        displayPictureUrl: subscriber.subscribedBy.displayPictureUrl,
                        sessionsLeft: (subscriber.totalSessions - subscriber.heldSessions)
                    });
                })
            }
        }
        else {
            const mySubscriptions = await Subscription.getAllForUser(userId);
            console.log("User=>", mySubscriptions);
            if(mySubscriptions.length > 0){
                await asyncForEach(mySubscriptions, async subscription => {
                    const slot = await Slot.findForSubsAndDay(subscription._id, day);
                    if (parseInt(slot.time) > parseInt(time)) {
                        todaySessions.push({
                            time: slot.subscription.time,
                            day:'Today',
                            name: subscription.trainerId.name,
                            displayPictureUrl: subscription.trainerId.displayPictureUrl,
                            sessionsLeft: (subscription.totalSessions - subscription.heldSessions)
                        });
                    }
    
                    const slotsNextDay = await Slot.findForSubsAndDay(subscription._id, nextDay);
                    nextDaySessions.push({
                        time: slotsNextDay.time,
                        day:slotsNextDay.dayOfWeek,
                        name: subscription.trainerId.name,
                        displayPictureUrl: subscription.trainerId.displayPictureUrl,
                        sessionsLeft: (subscription.totalSessions - subscription.heldSessions)
                    });
                });
            }
        }

        const record = await Posts.list();
        if (record.docs.length === 0) throw new Error("Could not retrieve posts");

        let nextPage;
        const posts = record.docs;
        if (record.page < record.total) {
            nextPage = parseInt(record.page) + 1;
        }

        res.json({ posts, todaySessions, nextDaySessions });

    } catch (err) {
        res.status(500).json({
            err: err.message
        });
    }
});

async function asyncForEach(array, callback) {
    console.log("array=>",array)
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports = router;