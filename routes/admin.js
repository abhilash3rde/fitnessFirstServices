const express = require('express');
const router = express.Router();

const Certificate = require('../models/Certificate');
const Utility = require('../utility/utility');
const TrainerData = require('../models/trainerData');

router.post('/certificate/:trainerid', async function (req, res, next) {
  try {
    const {trainerid} = req.params;
    const mediaFile = req.files ? req.files.mediaContent : null;
    const content = await Utility.uploadMedia(mediaFile);
    console.log(req.body.specility)
    console.log(mediaFile, '-----------------')
    if (!content)
      throw new Error("Pdf upload failed");

    const contentUrl = content.contentURL;
    const certificate = await Certificate.create({
      trainerId: trainerid,
      contentUrl,
      speciality : req.body.specility
    });

    const trainerData = await TrainerData.addCertificate(trainerid, certificate._id);

    res.json({certificate, trainerData});
  } catch (err) {
    console.log(err)
    res.status(500).json({
      err: err.message
    });
  }
});
module.exports = router;
