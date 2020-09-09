'use strict';

// const env = process.env.NODE_ENV;
const path = require('path');
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const router = require('express').Router({ mergeParams: true });
const saltRounds = 12;
const models = require(path.join(__dirname, '/../models'));
const generator = require('../helpers/password_generator');
const sequelize = models.sequelize;
const emailer = require('../email');

module.exports = function(authenticate) {
    router.get('/:admin_id', authenticate, async (req, res, next) => {
        const adminId = req.params.admin_id;
    
        if (!adminId) {
            return next(createError(400, 'Bad Request: Therapist ID is required.'));
        }
    
        try {
            models.AdminAccount.findOne({
                where: { admin_id: adminId }
            }).then(admin => {
                res.status(200).json(admin);
            }).catch(err => {
                res.status(400).json(err);
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });

    
    // TODO: Code for deleting admin
    router.put('/archive/:admin_id', authenticate, async (req, res, next) => {
        const adminId = req.params.admin_id;
    
        if (!adminId) {
            return next(createError(400, 'Bad Request: Admin ID is required.'));
        }

        models.AdminAccount.update({
            archived: true
        },
        {
            where: {
                admin_id: adminId
            }
        }).then(rec => {
            res.status(200).send(rec);
        }).catch(err => {
            res.status(400).send(err);
        });
    });
    
    // Get all admins
    router.get('/', authenticate, async (req, res, next) => {
    
        try {
            return models.AdminAccount.all({
                include: [{
                    model: models.UserAccount,
                }]
            }).then(admins => {
                getAdminInfo(admins).then(values => {
                    res.status(200).json(values);
                });
            }).catch(err => {
                res.status(500).send(err);
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });
    
    // TODO: Code for deleting admin
    router.delete('/:admin_id', authenticate,async (req, res, next) => {
        const adminId = req.params.admin_id;
    
        if (!adminId) {
            return next(createError(400, 'Bad Request: Therapist ID is required.'));
        }
    
        try {
            await models.Therapist.destroy({
                where: {
                    therapist_ID: adminId
                }
            });
            res.status(200).send();
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });

    // TODO: Code for deleting admin
    router.put('/:admin_id', authenticate, async (req, res, next) => {
        const adminId = req.params.admin_id;
        const admin = req.body;
    
        if (!adminId) {
            return next(createError(400, 'Bad Request: Admin ID is required.'));
        }

        if (req.body.password) {
            bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
                models.UserAccount.update({
                    first_name: admin.first_name,
                    middle_name: admin.middle_name,
                    last_name: admin.last_name,
                    email: admin.email,
                    password: hash,
                    date_of_birth: admin.date_of_birth,
                    contact_number: admin.contact_number,
                },
                {
                    where: {
                        user_account_ID: adminId
                    }
                }).then(rec => {
                    res.status(200).send(rec);
                }).catch(err => {
                    res.status(400).send(err);
                });
            });
        } else {
            models.UserAccount.update({
                first_name: admin.first_name,
                middle_name: admin.middle_name,
                last_name: admin.last_name,
                email: admin.email,
                date_of_birth: admin.date_of_birth,
                contact_number: admin.contact_number,
            },
            {
                where: {
                    user_account_ID: adminId
                }
            }).then(rec => {
                res.status(200).send(rec);
            }).catch(err => {
                res.status(400).send(err);
            });
        }
    });
    
    router.post('/admin', authenticate, (req, res, next) => {
        const admin = req.body;
        try {
            return models.UserAccount.findOne({
                where: {
                    email: admin.email
                }
            }).then(user => {
                if (!user) {
                    let pass = generator.password_generator();
                    bcrypt.hash(pass, saltRounds, async (err, hash) => {
                        return sequelize.transaction(t => {
                            return models.UserAccount.create({
                                first_name: admin.first_name,
                                middle_name: admin.middle_name,
                                last_name: admin.last_name,
                                email: admin.email,
                                password: hash,
                                date_of_birth: admin.date_of_birth,
                                contact_number: admin.contact_number,
                                user_role_id: 3
                            }, {transaction: t}).then((acc) => {
                                return models.AdminAccount.create({
                                    admin_id: acc.user_account_ID
                                }, {transaction: t}).then(adm => {
                                    emailer.sendEmail(admin.email, 'new_user', {name: admin.first_name, password: pass});
                                    res.status(200).send(adm);
                                }).catch(err => {
                                    res.status(500).send(err);
                                });
                            });
                        });
                    });
                } else {
                    // return sequelize.transaction(m => {
                    //     return models.AdminAccount.create({
                    //         admin_id: user.user_account_ID
                    //     }, {transaction: m}).then(admin => {
                    //         return models.UserAccount.update({
                    //             user_role_id: 3 // Hard-coded for now but change later
                    //         },{
                    //             where: {
                    //                 user_account_ID: user.user_account_ID
                    //             }
                    //         }, {transaction: m}).then(() => {
                    //             res.status(200).send(admin);
                    //         });
                    //     }).catch(err => {
                    //         res.status(500).send(err);
                    //     });
                    // });
                    res.status(400).send('User already exists');
                }
            }).catch(err => {
                return next(createError(err.status || 500, err.message || 'Internal Server Error'));
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });
    
    const getAdminInfo = async function (adminArray) {
        let returnArray = [];
        let adminObject = {};
    
        adminArray.forEach(element => {
            adminObject['user_type'] = 'clerk';
            adminObject['adminId'] = element.admin_id;
            adminObject['firstName'] = element.UserAccount.first_name;
            adminObject['middleName'] = element.UserAccount.middle_name;
            adminObject['lastName'] = element.UserAccount.last_name;
            adminObject['label'] = element.UserAccount.first_name  +' ' + element.UserAccount.last_name;
            adminObject['contactNumber'] = element.UserAccount.contact_number;
            adminObject['email'] = element.UserAccount.email;
            adminObject['dateOfBirth'] = element.UserAccount.date_of_birth;
            adminObject['archived'] = element.archived;
            returnArray.push(adminObject);
            adminObject = {};
        });
    
        return returnArray;
    };
    return router;
};