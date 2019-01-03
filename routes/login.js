const express = require('express');
const router = express.Router();

const {Pool, Client} = require('pg');

const pool = new Pool({ssl: true});

const bcrypt = require('bcrypt');

/* GET login page AND check if user is logged in */
router.get('/', function(req, res, next) {
    if(req.session.logged){
        return res.redirect('/');
    }
    res.render('login', { logged: req.session.logged });
});

/* Account login */
router.post('/', function(req, res, next) {

    pool.query('SELECT id,password FROM public.user where email = $1', [req.body.user_email] , (err, result) => {
        if (err) {
            throw err
        }
        // Check if user is exist
        if (result.rows.length > 0) {
            // Password validation
            bcrypt.compare(req.body.user_password, result.rows[0].password, function(err, password) {
                if(password){
                    // Creation of session
                    req.session.logged = true;
                    req.session.user = {id: result.rows[0].id};
                    return res.redirect('/user');
                }else{
                    return res.render('login', {logged: req.session.logged, message: "Your login credentials are incorrect."});
                }
            });
        }else{
            return res.render('login', {logged: req.session.logged, message: "Your login credentials are incorrect."});
        }

    });

});

module.exports = router;
