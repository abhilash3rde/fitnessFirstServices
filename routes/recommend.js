const express = require("express");
const router = express.Router();
const meal = require('../models/meal');
router.get("/", async function (req, res, next) {
  try {
    const {userId} = req;

    let result = await meal.get(
      userId,
    );
    res.json({result});
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err.message,
    });
  }
});

module.exports = router;


