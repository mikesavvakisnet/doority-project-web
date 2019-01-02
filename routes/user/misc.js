const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const {Pool} = require('pg');

const pool = new Pool({ssl: true});

router.get('/', function (req, res, next) {
    if (!req.session.logged) {
        return res.redirect('/');
    }
    res.render('user/misc', {logged: req.session.logged, telegram: req.session.telegram_bot, telegram_code: req.session.telegram_first_code});
});

router.post('/telegram-bot-verification', function (req, res, next) {
    if (!req.session.logged) {
        return res.redirect('/');
    }

    var first_code = crypto.randomBytes(5).toString('hex');

    pool.query('DELETE FROM public.telegram_verification WHERE user_id = $1', [req.session.user.id], (err, insertRes) => {
        if(err){
            return res.redirect('/');
        }

        pool.query('INSERT INTO public.telegram_verification (user_id,first_code) VALUES ($1,$2)', [req.session.user.id, first_code], (err, insertRes) => {
            if(err){
                return res.redirect('/');
            }
            req.session.telegram_bot = true;
            req.session.telegram_first_code = first_code;
            req.session.save(function (err) {
                if (err) return next(err);
                res.redirect('.');
            });

        });
    });

});

module.exports = router;