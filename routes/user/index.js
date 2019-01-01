const express = require('express');
const router = express.Router();

const {Pool, Client} = require('pg');

const pool = new Pool({ssl: true});

router.get('/', function(req, res, next) {
    if(!req.session.logged){
        return res.redirect('/login');
    }
    pool.query('SELECT user_id,name,surname,event_type,timestamp FROM public.access_log', (err, result) => {
        if (err) {
            throw err
        }
        res.render('user/index', {
            access_logs_data: result.rows,
            logged: req.session.logged
        });
    });
});

router.get('/logout', function(req, res, next) {
    req.session.destroy();
    return res.redirect('/login');
});

module.exports = router;
