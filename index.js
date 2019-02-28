const path = require('path')
const CronJob = require('cron').CronJob;
const { resetServer } = require('./reset-server');

// Reset the server every hour
const job = new CronJob('0 0 */1 * * *', resetServer);

resetServer()
    .then(() => job.start())
    .catch(err => console.error(err));
