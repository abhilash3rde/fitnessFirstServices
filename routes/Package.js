const express = require('express');
const router = express.Router();

const Package = require('../models/package');
const TrainerData = require('../models/trainerData');


router.post('/create', async function (req, res, next) {
  try {
    const {userId} = req;
    const {title, noOfSessions, price, description, category} = req.body;

    const package = await Package.create({
      title, noOfSessions, price, description, category
    });
    if (!package) throw new Error("Error in creating package");

    await TrainerData.addPackage(userId, package._id);
    res.json({package});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/:packageId', async function (req, res, next) {
  try {
    const {packageId} = req.params;
    const {title, noOfSessions, price, description, category} = req.body;

    const package_ = await Package.edit(packageId, {
      title, noOfSessions, price, description, category
    });
    if (!package_) throw new Error("Error in editing package");

    res.json({package: package_, success: true});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.get('/:packageId', async function (req, res, next) {
  try {
    const {packageId} = req.params;

    const package_ = await Package.get(packageId);
    if (!package_) throw new Error("Error in locating package");
    console.log(package_)
    res.json({package: package_});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.delete('/:packageId', async function (req, res, next) {
  try {
    const {packageId} = req.params;

    const package_ = await Package.remove(packageId);
    if (!package_) throw new Error("Error in deleting package");

    res.json({success: true});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/:packageId/activate', async function (req, res, next) {
  try {
    const {packageId} = req.params;
    await Package.activatepackage(packageId);
    res.json({success: true});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

router.put('/:packageId/deactivate', async function (req, res, next) {
  try {
    const {packageId} = req.params;
    await Package.deActivatePackage(packageId);
    res.json({success: true});
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
});

module.exports = router;