const cron = require('node-cron');

const task = cron.schedule('*/5 * * * * *', () =>  {

}, {
    scheduled: false
});

exports.task = task;