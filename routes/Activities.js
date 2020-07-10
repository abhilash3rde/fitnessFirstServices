const { userTypes, TIME_STRING, WEEK_DAYS } = require('../constants');
const Subscription = require('../models/Subscription');
const Slot = require('../models/slot');
const DateUtils = require('../utility/DateUtils');
const Appointment = require('../models/Appointment');

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
        if (slot) {
            todaySessions.push({
                time: slot.time,
                user: subscriber.subscribedBy,
                type:'SESSION'
            });
        }

        const slotsNextDay = await Slot.findForSubsAndDay(subscriber._id, nextDay);
        if (slotsNextDay) {
            nextDaySessions.push({
                time: slotsNextDay.time,
                user: subscriber.subscribedBy,
                type:'SESSION'
            });
        }
    });

    const todaysAppointments = await Appointment.getTrainerAppointmentsForDate(trainerId, date);
    const tomorrow = new Date(date.setDate(date.getDate() + 1));
    const tomorrowsAppointments = await Appointment.getTrainerAppointmentsForDate(trainerId, tomorrow);

    let todaysEvents = [...nextDaySessions];
    todaysAppointments.forEach(appointment=>{
        todaysEvents.push({
            time: appointment.time,
            user: appointment.userId,
            type:'APPOINTMENT'
        })
    });

    let tomorrowsEvents = [...todaySessions];
    tomorrowsAppointments.forEach(appointment=>{
        tomorrowsEvents.push({
            time: appointment.time,
            user: appointment.userId,
            type:'APPOINTMENT'
        })
    });

    todaysEvents.sort((o1, o2)=> parseInt(o1.time) - parseInt(o2.time));
    tomorrowsEvents.sort((o1, o2)=> parseInt(o1.time) - parseInt(o2.time));

    return { todaysEvents, tomorrowsEvents }
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
        if (slot) {
            todaySessions.push({
                time: slot.time,
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

    const todaysAppointments = await Appointment.getuserAppointmentsForDate(userId, date);
    const tomorrow = new Date(date.setDate(date.getDate() + 1));
    const tomorrowsAppointments = await Appointment.getuserAppointmentsForDate(userId, tomorrow);

    let todaysEvents = [...nextDaySessions];
    todaysAppointments.forEach(appointment=>{
        todaysEvents.push({
            time: appointment.time,
            user: appointment.trainerId,
            type:'APPOINTMENT'
        })
    });

    let tomorrowsEvents = [...todaySessions];
    tomorrowsAppointments.forEach(appointment=>{
        tomorrowsEvents.push({
            time: appointment.time,
            user: appointment.trainerId,
            type:'APPOINTMENT'
        })
    });

    todaysEvents.sort((o1, o2)=> parseInt(o1.time) - parseInt(o2.time));
    tomorrowsEvents.sort((o1, o2)=> parseInt(o1.time) - parseInt(o2.time));

    return { todaysEvents, tomorrowsEvents }
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