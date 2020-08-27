const express = require("express");
const router = express.Router();
//{"25/8/2020": 4250, "26/8/2020": 1000}
const waterIntake = require("../models/waterIntake");
router.post("/", async function (req, res, next) {
  try {
    let { userId } = req;
    let result = await waterIntake.createOrUpdate(
      userId,
      req.body.date,
      req.body.quantity
    );

    console.log(result);

    res.json({ success: true });
  } catch (error) {
    console.log("error in waterIntake routes");
    res.status(500).json({ error: error });
    console.log(error);
  }
});
module.exports = router;
