const path = require('path')
const CronJob = require('cron').CronJob;
const { resetServer } = require('./reset-server');

resetServer()
    .catch(err => console.error(err));
