const express = require("express");
const router = express.Router();
const meal=require('../models/meal');
router.get("/", async function (req, res, next) {
  try {
    const { userId } = req;

    let result = await meal.get(
      userId,
    );

    console.log(result);
    res.json({ success: true });
  } catch (err) {
    console.log("routes file mei error hai");

    res.status(500).json({
      err: err.message,
    });
  }
});

module.exports = router;
//
//module.exports = router;mongodb+srv://boi:244466666@cluster0-nssjy.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true


