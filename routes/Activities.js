const { userTypes, TIME_STRING, WEEK_DAYS } = require('../constants');
const Subscription = require('../models/Subscription');
const Slot = require('../models/slot');
const DateUtils = require('../utility/DateUtils')

async function getTrainerActivities(trainerId) {
    const todaySessions = [];
    const nextDaySessions = [];

    const date = await DateUtils.getTimeZoneDate("IN");
    const day = WEEK_DAYS[date.getDay()];
    const nextDay = WEEK_DAYS[date.getDay() + 1];
    const time = TIME_STRING[date.getHours()];

    const mySubscribers = await Subscription.getAllForTrainer(trainerId);

    await asyncForEach(mySubscribers, async subscriber => {
        const slot = await Slot.findForSubsAndDay(subscriber._id, day);
        if (slot && parseInt(slot.time) > parseInt(time)) {
            todaySessions.push({
                time: slot.time,
                user: subscriber.subscribedBy,
                day: 'Today',
                sessionsLeft: (subscriber.totalSessions - subscriber.heldSessions)
            });
        }

        const slotsNextDay = await Slot.findForSubsAndDay(subscriber._id, nextDay);
        if (slotsNextDay) {
            nextDaySessions.push({
                time: slotsNextDay.time,
                day: slotsNextDay.dayOfWeek,
                user: subscriber.subscribedBy,
                sessionsLeft: (subscriber.totalSessions - subscriber.heldSessions)
            });
        }
    });
    return { todaySessions, nextDaySessions }
}

async function getUserActivities(userId) {
    const todaySessions = [];
    const nextDaySessions = [];

    const date = await DateUtils.getTimeZoneDate("IN");
    const day = WEEK_DAYS[date.getDay()];
    const nextDay = WEEK_DAYS[date.getDay() + 1];
    const time = TIME_STRING[date.getHours()];

    const mySubscriptions = await Subscription.getAllForUser(userId);
    await asyncForEach(mySubscriptions, async subscription => {
        const slot = await Slot.findForSubsAndDay(subscription._id, day);
        if (slot && parseInt(slot.time) > parseInt(time)) {
            todaySessions.push({
                time: slot.subscription.time,
                day: 'Today',
                trainer: subscription.trainerId,
                sessionsLeft: (subscription.totalSessions - subscription.heldSessions)
            });
        }

        const slotsNextDay = await Slot.findForSubsAndDay(subscription._id, nextDay);
        if (slotsNextDay) {
            nextDaySessions.push({
                time: slotsNextDay.time,
                day: slotsNextDay.dayOfWeek,
                trainer: subscription.trainerId,
                sessionsLeft: (subscription.totalSessions - subscription.heldSessions)
            });
        }
    });

    return { todaySessions, nextDaySessions }
}

async function asyncForEach(array, callback) {
    console.log("array=>", array)
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports = {
    getTrainerActivities, 
    getUserActivities
}