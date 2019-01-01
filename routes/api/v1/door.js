const express = require('express');
const router = express.Router();

const {Pool} = require('pg');

const pool = new Pool({ssl: true});

router.get('/open', function (req, res, next) {

    pool.query('SELECT * FROM public.status', (err, result) => {
        if (err) {
            throw err
        }

        if (result.rows.length > 0) {
            res.status(200).send();
        } else {
            res.status(403).send();
        }
    })
});


router.get('/status', function (req, res, next) {

    pool.query('SELECT * FROM public.status', (err, result) => {
        if (err) {
            throw err
        }

        if (result.rows.length > 0) {
            res.status(200).send(
                {
                    problem: false,
                    isOpen: true
                }
            );
        } else {
            res.status(200).send(
                {
                    problem: false,
                    isOpen: false
                }
            );
        }
    })
});

router.post('/status', function (req, res, next) {

    // Remove whitespaces
    const rfid_id_tag = (req.body.rfid_id).replace(/\s+/g, '');


    pool.query('SELECT * FROM public.user WHERE rfid_id = $1', [rfid_id_tag], (err, userResult) => {
        if (err) {
            console.log(err);
            res.status(500).send(
                {
                    problem: true
                }
            );
            return;
        }

        if (userResult.rows.length === 0) {
            res.status(404).send(
                {
                    problem: true
                }
            );
            return;
        }

        pool.query('SELECT * FROM public.status WHERE rfid_id = $1', [rfid_id_tag], (err, result) => {
            if (err) {
                res.status(500).send(
                    {
                        problem: true
                    }
                );
                return;
            }


            if (result.rows.length === 0) {
                pool.query('INSERT INTO public.status (rfid_id,status) VALUES ($1,$2)', [rfid_id_tag, true], (err, result) => {
                    if (err) {
                        res.status(500).send(
                            {
                                problem: true
                            }
                        );
                        return;
                    }

                    pool.query('INSERT INTO public.access_log (rfid_id,timestamp,event_type,user_id,name,surname) VALUES ($1,NOW(),$2,$3,$4,$5)', [rfid_id_tag, 0, userResult.rows[0].id, userResult.rows[0].name, userResult.rows[0].surname], (err, result) => {
                        if (err) {
                            return;
                        }
                    });

                    res.status(201).send({
                        problem: false,
                        status: true
                    });
                });
            } else {
                pool.query('DELETE FROM public.status WHERE rfid_id = $1', [rfid_id_tag], (err, result) => {
                    if (err) {
                        res.status(500).send({
                            problem: true
                        });
                        return;
                    }

                    pool.query('INSERT INTO public.access_log (rfid_id,timestamp,event_type,user_id,name,surname) VALUES ($1,NOW(),$2,$3,$4,$5)', [rfid_id_tag, 1, userResult.rows[0].id, userResult.rows[0].name, userResult.rows[0].surname], (err, result) => {
                        if (err) {
                            return;
                        }
                    });
                    res.status(200).send({
                        problem: false,
                        status: false
                    });
                });
            }
        });
    });

});

module.exports = router;
