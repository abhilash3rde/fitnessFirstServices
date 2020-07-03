const express = require('express');
const router = express.Router();

const TrainerData = require('../models/trainerData');
const Subscription = require('../models/Subscription');
const Slot = require('../models/slot');
const Package = require('../models/package');
const Utility = require('../utility/utility');

router.post('/:trainerId/:packageId', async function (req, res, next) {
    try {
        const { userId } = req;
        const { trainerId, packageId } = req.params;

        const { time, days } = req.body;

        const trainerData = await TrainerData.getById(trainerId);
        const package = trainerData.packages.find(package => package._id === packageId);

        
        const availableSlots = trainerData.slots.filter(slot => {
            if (!slot.subscriptionId && slot.time === time && days.includes(slot.dayOfWeek)) {
                return true;
            }
        });

        const availableDays = availableSlots.flatMap(availableSlot => availableSlot.dayOfWeek);

        if (!package) {
            throw new Error("Invalid package");
        }
        
        if (!days || !days.length > 0) {
            throw new Error("Training days missing");
        }

        Utility.findMissingValue(days, availableDays, day=>{
            if(day.length > 0){
                throw new Error("Slot not available for " + day + " at " + time);
            }
        });

        const _subscription = await Subscription.create({
            packageId, trainerId, subscribedBy: userId, totalSessions: package.noOfSessions
        });
        
        availableSlots.map(async slot=>{
            await Slot.edit(slot._id, {
                subscriptionId : _subscription._id
            })
        });

        await Subscription.activateSubscription(_subscription._id);

        res.json({ _subscription, success: true });
    } catch (err) {
        res.status(500).json({
            err: err.message
        });
    }
});


router.put('/:subsId/activate', async function (req, res, next) {
    try {
        const { subsId } = req.params;

        await Subscription.activateSubscription(subsId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({
            err: err.message
        });
    }
});

router.put('/:subsId/deactivate', async function (req, res, next) {
    try {
        const { subsId } = req.params;

        await Subscription.deActivateSubscription(subsId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({
            err: err.message
        });
    }
});

module.exports = router;