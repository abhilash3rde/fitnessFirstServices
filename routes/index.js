const express = require('express');
const router = express.Router();
const Logger = require('../services/logger_service')
let logg = new Logger('index')
router.get('/', function(req, res, next) {
  const ipInfo = req.ipInfo;
  const message = `Hey, you are browsing from ${ipInfo.city}, ${ipInfo.country}`;
  logg.info('index',message)
  res.json( { title: 'Gym-api', message});
});

module.exports = router;
