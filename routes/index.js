const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  const ipInfo = req.ipInfo;
  const message = `Hey, you are browsing from ${ipInfo.city}, ${ipInfo.country}`;
  res.json( { title: 'Gym-api', message });
});

module.exports = router;
