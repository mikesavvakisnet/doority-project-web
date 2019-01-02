const express = require('express');
const router = express.Router();

const {Pool} = require('pg');

const pool = new Pool({ssl: true});

const bcrypt = require('bcrypt');

router.get('/', function (req, res, next) {
    if (!req.session.logged) {
        return res.redirect('/');
    }
    res.render('user/misc', {logged: req.session.logged});
});


router.post('/', function (req, res, next) {
    if (!req.session.logged) {
        return res.redirect('/');
    }
    // Create salty hashy password.
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(req.body.user_password, salt, function (err, hash) {
            pool.query('UPDATE public.user SET password = $1 where id = $2 ', [hash, req.session.user.id], (err, insertRes) => {
                if (!err) {
                    return res.redirect('/user/logout');
                }
            });
        });
    });
});

module.exports = router;