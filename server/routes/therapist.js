'use strict';

// const env = process.env.NODE_ENV;
const path = require('path');
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const router = require('express').Router({ mergeParams: true });
const saltRounds = 12;
// const Op = require('sequelize').Op;
// const fs = require('fs');
const models = require(path.join(__dirname, '/../models'));
const generator = require('../helpers/password_generator');
const sequelize = models.sequelize;
const emailer = require('../email');

module.exports = function (authenticate) {
    router.get('/:therapist_id', authenticate, async (req, res, next) => {
        const therapistID = req.params.therapist_id;

        if (!therapistID) {
            return next(createError(400, 'Bad Request: Therapist ID is required.'));
        }

        try {
            const Therapist = async () => {
                return models.Therapist.findOne({
                    where: { therapist_ID: therapistID }
                });
            };
            res.status(200).json(Therapist);
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });

    // Get all therapists
    router.get('/', authenticate, async (req, res, next) => {

        try {
            return models.Therapist.all({
                include: [{
                    model: models.UserAccount
                }, {
                    model: models.TherapistType,
                    include: [{
                        model: models.Type
                    }]
                }]
            }).then(async therapists => {
                const values = await getTherapistInfo(therapists);
                res.status(200).json(values);
            }).catch(err => {
                res.status(500).send(err);
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });

    // TODO: Change it so that it doesnt have repitition
    router.put('/:therapist_id', authenticate, async (req, res, next) => {
        const therapist = req.body;
        const therapistID = req.params.therapist_id;
        const types = models.Type.findAll({ where: { type_code: therapist.types } }).then(values => {
            return values;
        });
        if (!therapistID) {
            return next(createError(400, 'Bad Request: Therapist ID is required.'));
        }

        return Promise.all([types]).then(response => {
            if (therapist.password) {
                bcrypt.hash(therapist.password, saltRounds, async (err, hash) => {
                    if (err) {
                        res.status(500).send(err);
                    } else {
                        return sequelize.transaction(t => {
                            return models.UserAccount.update(
                                {
                                    first_name: therapist.first_name,
                                    middle_name: therapist.middle_name,
                                    last_name: therapist.last_name,
                                    email: therapist.email,
                                    date_of_birth: therapist.date_of_birth,
                                    contact_number: therapist.contact_number,
                                    password: hash
                                },
                                {
                                    where: {
                                        user_account_ID: therapistID
                                    }
                                },
                                { transaction: t }).then(() => {
                                return models.Therapist.update({
                                    code: therapist.code,
                                    archived: therapist.archived
                                },
                                {
                                    where: { therapist_id: therapistID }
                                }, 
                                { transaction: t }).then(() => {
                                    return models.TherapistType.destroy({
                                        where: { therapist_id: therapistID }
                                    }).then(() => {
                                        return typeCodeArray(therapist, response[0])
                                            .then(values => {
                                                return models.TherapistType.bulkCreate(values, { transaction: t })
                                                    .then(result => {
                                                        res.status(200).send(result);
                                                    });
                                            }).catch(err => {
                                                res.status(500).send(err);
                                            });
                                    }).catch(err => {
                                        res.status(500).send(err);
                                    });
                                });
                            });
                        });
                    }
                });
            } else {
                return sequelize.transaction(t => {
                    return models.UserAccount.update(
                        {
                            first_name: therapist.first_name,
                            middle_name: therapist.middle_name,
                            last_name: therapist.last_name,
                            email: therapist.email,
                            date_of_birth: therapist.date_of_birth,
                            contact_number: therapist.contact_number,
                        },
                        {
                            where: {
                                user_account_ID: therapistID
                            }
                        },
                        { transaction: t }).then(() => {
                        return models.Therapist.update({
                            code: therapist.code,
                            archived: therapist.archived
                        },
                        {
                            where: { therapist_id: therapistID }
                        }, 
                        { transaction: t }).then(() => {
                            return models.TherapistType.destroy({
                                where: { therapist_id: therapistID }
                            }).then(() => {
                                return typeCodeArray(therapist, response[0])
                                    .then(values => {
                                        return models.TherapistType.bulkCreate(values, { transaction: t })
                                            .then(result => {
                                                res.status(200).send(result);
                                            });
                                    }).catch(err => {
                                        res.status(500).send(err);
                                    });
                            }).catch(err => {
                                res.status(500).send(err);
                            });
                        });
                    });
                });
            }
            
        }).catch(err => {
            res.status(400).send(err);
        });
    });

    // TODO: Code for deleting therapist
    router.delete('/:therapist_id', authenticate, async (req, res, next) => {
        const therapistID = req.params.therapist_id;

        if (!therapistID) {
            return next(createError(400, 'Bad Request: Therapist ID is required.'));
        }

        try {
            await models.Therapist.destroy({
                where: {
                    therapist_ID: therapistID
                }
            });
            res.status(200).send();
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });

    router.put('/archive/:therapist_id', authenticate, async (req, res, next) => {
        const therapistID = req.params.therapist_id;

        if (!therapistID) {
            return next(createError(400, 'Bad Request: Therapist ID is required.'));
        }

        try {
            await models.Therapist.update({
                archived: true
            },
            {
                where: {
                    therapist_ID: therapistID
                }
            }
            );
            res.status(200).send({message: 'Successfully archived therapist'});
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });

    router.post('/therapist', authenticate, (req, res, next) => {
        const therapist = req.body;
        const types = models.Type.findAll({ where: { type_code: therapist.types } }).then(values => {
            return values;
        });
        try {
            return models.UserAccount.findOne({
                where: {
                    email: therapist.email
                }
            }).then(user => {
                if (!user) {
                    let pass = generator.password_generator();
                    bcrypt.hash(pass, saltRounds, async (err, hash) => {
                        return Promise.all([types]).then(response => {
                            return sequelize.transaction(t => {
                                return models.UserAccount.create({
                                    first_name: therapist.first_name,
                                    middle_name: therapist.middle_name,
                                    last_name: therapist.last_name,
                                    email: therapist.email,
                                    password: hash,
                                    date_of_birth: therapist.date_of_birth,
                                    contact_number: therapist.contact_number,
                                    user_role_id: 2
                                }, { transaction: t }).then((acc) => {
                                    return models.Therapist.create({
                                        therapist_id: acc.user_account_ID,
                                        code: therapist.code
                                    }, { transaction: t }).then(ther => {
                                        return typeCodeArray(ther, response[0])
                                            .then(values => {
                                                return models.TherapistType.bulkCreate(values, { transaction: t })
                                                    .then(result => {
                                                        emailer.sendEmail(therapist.email, 'new_user', {name: therapist.first_name, password: pass});
                                                        res.status(201).send(result);
                                                    });
                                            }).catch(err => {
                                                res.status(500).send(err);
                                            });
                                    }).catch(err => {
                                        res.status(500).send(err);
                                    });
                                });
                            });
                        }).catch(err => {
                            res.status(500).send(err);
                        });
                    });
                } else {
                    // return Promise.all([types]).then(response => {
                    //     return sequelize.transaction(m => {
                    //         return models.Therapist.create({
                    //             therapist_id: user.user_account_ID,
                    //             code: therapist.code
                    //         }, { transaction: m }).then(ther => {
                    //             return models.UserAccount.update({
                    //                 user_role_id: 2 // Hard-coded for now but change later
                    //             }, {
                    //                 where: {
                    //                     user_account_ID: user.user_account_ID
                    //                 }
                    //             }, { transaction: m }).then(() => {
                    //                 return typeCodeArray(ther, response[0])
                    //                     .then(values => {
                    //                         return models.TherapistType.bulkCreate(values, { transaction: m })
                    //                             .then(result => {
                    //                                 res.status(200).send(result);
                    //                             });
                    //                     }).catch(err => {
                    //                         res.status(500).send(err);
                    //                     });
                    //             });
                    //         }).catch(err => {
                    //             res.status(500).send(err);
                    //         });
                    //     });
                    // }).catch(err => {
                    //     res.status(500).send(err);
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

    const typeCodeArray = async function (therapist_record, typeCodes) {
        let ret = [];
        let i = 0;
        typeCodes.map(typeCode => {
            ret[i] = {
                therapist_id: therapist_record.therapist_id,
                type_id: typeCode.type_id
            };
            i++;
        });
        return ret;
    };

    const getTherapistInfo = async function (therapistsArray) {
        let returnArray = [];
        let therapistObject = {};

        therapistsArray.forEach(element => {
            therapistObject['userType'] = 'therapist';
            therapistObject['therapistId'] = element.therapist_id;
            therapistObject['code'] = element.code;
            therapistObject['firstName'] = element.UserAccount.first_name;
            therapistObject['middleName'] = element.UserAccount.middle_name;
            therapistObject['lastName'] = element.UserAccount.last_name;
            therapistObject['label'] = element.UserAccount.first_name + ' ' + element.UserAccount.middle_name + ' ' + element.UserAccount.last_name + ' ( ' + element.code + ' )';
            therapistObject['contactNumber'] = element.UserAccount.contact_number;
            therapistObject['email'] = element.UserAccount.email;
            therapistObject['dateOfBirth'] = element.UserAccount.date_of_birth;
            therapistObject['archived'] = element.archived;
            therapistObject['types'] = [];
            let typeArray = element.TherapistTypes;
            if (typeArray != null) {
                let typeObject = {};
                typeArray.forEach(typeValue => {
                    typeObject['key'] = typeValue.Type.type_id;
                    typeObject['label'] = typeValue.Type.type_code;
                    typeObject['value'] = typeValue.Type.type_code;
                    therapistObject['types'].push(typeObject);

                    typeObject = {};
                });
            }
            returnArray.push(therapistObject);
            therapistObject = {};
        });

        return returnArray;
    };

    return router;
};