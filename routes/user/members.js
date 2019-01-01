const express = require('express');
const router = express.Router();

const {Pool, Client} = require('pg');

const pool = new Pool({ssl: true});

router.get('/', function(req, res, next) {
    if(!req.session.logged){
        return res.redirect('/login');
    }

    pool.query('SELECT name,surname,public.user.rfid_id,status FROM public.status RIGHT JOIN public.user on(public.user.rfid_id = public.status.rfid_id)', (err, result) => {
        if (err) {
            throw err
        }
        res.render('user/members', {
            members: result.rows,
            logged: req.session.logged
        });
    });

});

module.exports = router;
