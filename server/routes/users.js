var express = require('express');
var router = express.Router();
const createError = require('http-errors');
const path = require('path');
const models = require(path.join(__dirname, '/../models'));
const bcrypt = require('bcrypt');
const saltRounds = 12;
const sequelize = models.sequelize;

module.exports = function(authenticate) {
    router.get('/', authenticate, async (req, res, next) => {
        try {
            await models.UserAccount.all().then(records => {
                res.status(200).send(JSON.stringify(records));
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });
    
    router.put('/reset_pass/:user_id', authenticate, function (req, res, next) {
        if (!(req.params.user_id && req.body.password)) {
            res.status(400).send('Bad Request');
            return;
        }
        
        bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
            let accountId = req.params.user_id;
            models.UserAccount.findOne({ 
                where: { user_account_ID: accountId }
            }).then(account => {
                if (account) {
                    if (verifyPassword(account, req.body.old_password)) {
                        account.updateAttributes({ password: hash }).then(() => {
                            res.status(200).send({ status: 'SUCCESS' });
                        }).catch(err => {
                            res.status(500).send(err);
                        });
                    } else {
                        res.status(400).send({status: 'INVALID'});
                    }
                } else {
                    res.status(400).send('Bad Request');
                }
            }).catch(function (err) {
                res.status(500).send(err);
            });
        });
    });
    
    router.put('/patient/:patient_id', authenticate, function (req, res, next) {
        const patient = req.body;
        if (!req.params.patient_id) {
            res.status(400).send('Bad Request');
            return;
        }
        return sequelize.transaction(t => {
            return models.UserAccount.update(
                {
                    first_name: patient.first_name,
                    middle_name: patient.middle_name,
                    last_name: patient.last_name,
                    email: patient.email,
                    date_of_birth: patient.date_of_birth,
                    contact_number: patient.contact_number,
                    user_role_id: patient.user_role_id,
                    archived: req.body.archived
                },
                { 
                    where: {
                        user_account_ID: req.body.patient_id
                    }
                },
                {transaction: t}).then(() => {
                return models.UserAccount.update(
                    {
                        patient_number: req.body.patient_number,
                        archived: req.body.archived
                    },
                    { 
                        where: {
                            patient_id: req.params.patient_id
                        }
                    },
                    {transaction: t}).then(() => {
                    res.status(200).send({SUCCESS: true});
                });
            });
        }).catch(err => {
            res.status(500).send(err);
        });
    });


    const verifyPassword = function (user, password) {
        return bcrypt.compareSync(password, user.password);
    };

    // Update from the User Profile
    router.put('/user/:user_id', async (req, res, next) => {
        const userID = req.params.user_id;
        const userInfo = req.body;

        if (!userID) {
            return next(createError(400, 'Bad Request: User ID is required.'));
        }

        try {
            models.UserAccount.update(
                {
                    contact_number: userInfo.contact_number,
                    first_name: userInfo.first_name,
                    middle_name: userInfo.middle_name,
                    last_name: userInfo.last_name
                },
                {
                    where: {
                        user_account_ID: userID
                    }
                }).then(obj => {
                res.status(200).send(obj);
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });

    // Update from the User Profile
    router.get('/user/:user_id', async (req, res, next) => {
        const userID = req.params.user_id;

        if (!userID) {
            return next(createError(400, 'Bad Request: User ID is required.'));
        }

        models.UserAccount.findOne({
            where: { user_account_ID: userID }
        }).then(user => {
            let info = {
                user_account_ID: user.user_account_ID,
                first_name: user.first_name,
                middle_name: user.middle_name,
                last_name: user.last_name,
                contact_number: user.contact_number,
                email: user.email
            };
            res.status(200).send(info);
        }).catch(err => {
            res.status(400).send('User not found');
        });

    });

    return router;
};
