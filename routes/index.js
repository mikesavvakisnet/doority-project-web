const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    if (req.session.logged) {
        return res.redirect('/user');
    }else{
        return res.redirect('/login');
    }

});

module.exports = router;
