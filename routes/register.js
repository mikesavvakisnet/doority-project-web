const express = require('express');
const router = express.Router();

const {Pool, Client} = require('pg');

const pool = new Pool({ssl: true});

const bcrypt = require('bcrypt');

/* GET register page AND check if user is logged in */
router.get('/', function (req, res, next) {
    if (req.session.logged) {
        return res.redirect('/');
    }
    res.render('register', {logged: req.session.logged});
});

/* Account creation */
router.post('/', function (req, res, next) {
    pool.query('SELECT id FROM public.user where email = $1', [req.body.user_email], (err, result) => {
        if (err) {
            throw err
        }

        if (result.rows.length == 0) {

            // Create salty hash password
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(req.body.user_password, salt, function (err, hash) {
                    pool.query('INSERT INTO public.user_registration (email,password) VALUES ($1,$2)', [req.body.user_email, hash], (err, insertRes) => {
                        if(!err){
                            return res.redirect('/');
                        }
                    });
                });
            });
        }

    });

});

module.exports = router;