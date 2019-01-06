const cron = require('node-cron');

const {Pool} = require('pg');

const pool = new Pool({ssl: true});

const exitReminder = cron.schedule('*/5 * * * * *', () =>  {
    pool.query('SELECT rfid_id FROM public.status', (err, result) => {
        if(err){
            return;
        }

        if (result.rows.length > 0) {
            for(let i = 0;i< result.rows.length; i++){
                pool.query(`select (timestamp+INTERVAL '2' HOUR) <= NOW() AS isForgot from access_log where rfid_id = '8CE8CA35' AND event_type = 0 ORDER BY ID DESC LIMIT 1;`, [result.rows[i].rfid_id], (err, on) => {
                    console.log(err);
                    //TODO: alert users
                });
            }
        }

    });
}, {
    scheduled: false
});

exports.exitReminder = exitReminder;