'use strict';

// const env = process.env.NODE_ENV;
const generator = require('../helpers/password_generator');
// const settingGetter = require('../helpers/get_setting');
// const categoryGetter = require('../helpers/get_category');
const path = require('path');
const createError = require('http-errors');
const bcrypt = require('bcrypt');

const router = require('express').Router({ mergeParams: true });
const models = require(path.join(__dirname, '/../models'));
const moment = require('moment');
// var passport = require('passport');
// const authenticate = passport.authenticate('jwt', {session: false});
const emailer = require('../email');
const sequelize = models.sequelize;
const saltRounds = 12;

module.exports = function(authenticate) {
    router.get('/', authenticate, async (req, res, next) => {
        models.Patient.all({
            include: [{
                model: models.UserAccount
            }, {
                model: models.PatientRecord
            }]
        }).then(async records => {
            const values = await getPatientInfo(records);
            res.status(200).send(JSON.stringify(values));
        });
    });
    
    router.get('/:patient_id', authenticate, async (req, res, next) => {
        const patientID = req.params.patient_id;
    
        if (!patientID) {
            return next(createError(400, 'Bad Request: Patient ID is required.'));
        }
    
        try {
            models.Patient.findOne({
                where: { 
                    patient_id: patientID
                }
            })
                .then(patient => {
                    res.status(200).json(patient);
                });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });
    
    // Code for updating a patient record
    router.put('/:patient_id', authenticate, async (req, res, next) => {
        const recordID = req.body.record.patient_record_id;
        const patient = req.body;
        const record = req.body.record;
        
        if (!recordID) {
            return next(createError(400, 'Bad Request: Record ID is required.'));
        }
    
        if (!patient || !record) {
            return next(createError(400, 'Bad Request: Patient Record information is required.'));
        }
        
        const patientCategory = models.PatientCategory.findOne({ where: { category: record.category } });
        const patientSetting = models.PatientSetting.findOne({ where: { setting_type: record.setting } });
        const user = models.UserAccount.findOne({ where: { user_account_ID: patient.patient_id } });
    
        Promise.all([patientCategory, patientSetting, user]).then(responses => {
            if (patient.password) {
                bcrypt.hash(patient.password, saltRounds, async (err, hash) => {
                    if (err) {
                        res.status(500).send(err);
                    }
                    sequelize.query(updateRecordQuery, {
                        bind: [
                            recordID,
                            patient.first_name, patient.middle_name, patient.last_name, patient.contact_number, patient.email,
                            hash,
                            patient.patient_number,
                            record.program, record.admission_date, record.discharge_date,
                            responses[1].patient_setting_ID, responses[0].category,
                            record.interruption_days, record.diagnosis, record.comments,
                            patient.date_of_birth
                        ],
                        raw: true,
                        type: sequelize.QueryTypes.UPDATE
                    }).then(() => {
                        res.status(200).send({message: 'Successfully updated patient record'});
                    }).catch(err => {
                        res.status(400).send(err);
                    });
                });
            } else {
                sequelize.query(updateRecordQuery, {
                    bind: [
                        recordID,
                        patient.first_name, patient.middle_name, patient.last_name, patient.contact_number, patient.email,
                        responses[2].password,
                        patient.patient_number,
                        record.program, record.admission_date, record.discharge_date,
                        responses[1].patient_setting_ID, responses[0].category,
                        record.interruption_days, record.diagnosis, record.comments,
                        patient.date_of_birth
                    ],
                    type: sequelize.QueryTypes.UPDATE
                }).then(result => {
                    res.status(200).send({message: 'Successfully updated patient record'});
                }).catch(err => {
                    res.status(400).send(err);
                });
            }
        }).catch(err => {
            res.status(500).send(err);
        });
    });
    

    router.put('/archive/:patient_id', authenticate, async (req, res, next) => {
        const patientID = req.params.patient_id;

        if (!patientID) {
            return next(createError(400, 'Bad Request: Patient ID is required.'));
        }

        return sequelize.transaction(t => {
            return models.Patient.update({
                archived: true
            },
            {
                where: {
                    patient_id: patientID
                }
            }, {transaction: t}).then(() => {
                return models.PatientRecord.update({
                    archived: true
                }, {
                    where: {
                        patient_id: patientID
                    }
                }, {transaction: t}).then(() => {
                    res.status(200).send({message: 'Successfully archived patient'});
                });
            });
        }).catch(err => {
            res.status(400).send(err);
        });
    });

    // TODO: Code for deleting patient
    router.delete('/:patient_id', async (req, res, next) => {
        const patientID = req.params.patient_id;
    
        if (!patientID) {
            return next(createError(400, 'Bad Request: Patient ID is required.'));
        }
    
        try {
            await models.Patient.destroy({
                where: {
                    patient_ID: patientID
                }
            });
            res.status(200).send();
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });
    
    router.post('/patient', authenticate, (req, res, next) => {
        const patient = req.body;
        const patientCategory = models.PatientCategory.findOne({ where: { category: patient.category } });
        const patientSetting = models.PatientSetting.findOne({ where: { setting_type: patient.setting } });
        try {
            return models.UserAccount.findOne({
                where: {
                    email: patient.email
                }
            }).then(user => {
                if (!user) {
                    let pass = generator.password_generator();
                    bcrypt.hash(pass, saltRounds, async (err, hash) => {
                        Promise.all([patientCategory, patientSetting]).then(responses => {
                            return sequelize.transaction(t => {
                                return models.UserAccount.create({
                                    first_name: patient.first_name,
                                    middle_name: patient.middle_name,
                                    last_name: patient.last_name,
                                    email: patient.email,
                                    password: hash,
                                    date_of_birth: patient.date_of_birth,
                                    contact_number: patient.contact_number,
                                    user_role_id: 1
                                }, {transaction: t}).then((acc) => {
                                    // Creating a patient 
                                    return models.Patient.create({
                                        patient_id: acc.user_account_ID,
                                        patient_number: patient.patient_number
                                    }, {transaction: t}).then(pat => {
                                        // Creating a patient record
                                        return models.PatientRecord.create({
                                            patient_id: pat.patient_id,
                                            admission_date: moment(patient.admission_date).toISOString(true),
                                            discharge_date: moment(patient.discharge_date).toISOString(true),
                                            comments: patient.comments,
                                            program: patient.program,
                                            diagnosis: patient.diagnosis,
                                            archived: false, //For a new patient, it will always be false
                                            is_active: true, //For a new patient, it will always be true
                                            patient_setting_id: responses[1].patient_setting_ID,
                                            patient_category_id: responses[0].category
                                        }, {transaction: t}).catch(err => {
                                            return next(createError(err.status || 500, err.message || 'Internal Server Error'));
                                        }, {transaction: t}).then(val => {
                                            emailer.sendEmail(patient.email, 'new_user', {name: patient.first_name, password: pass});
                                            return res.status(200).send(val);
                                        }).catch(err => {
                                            return res.status(400).send(err);
                                        });
                                    }).catch(err => {
                                        return res.status(400).send(err);
                                    });
                                }).catch(error => {
                                    return res.status(400).send(error);
                                });
                            });
                        });
                    });
                } else {
                    // Promise.all([patientCategory, patientSetting]).then(responses => {
                    //     return sequelize.transaction(m => {
                    //         return models.Patient.create({
                    //             patient_id: user.user_account_ID,
                    //             patient_number: patient.patient_number
                    //         }, {transaction: m}).then(pat => {
                    //             return models.PatientRecord.create({
                    //                 patient_id: pat.patient_id,
                    //                 admission_date: patient.admission_date,
                    //                 discharge_date: patient.discharge_date,
                    //                 comments: patient.comments,
                    //                 diagnosis: patient.diagnosis,
                    //                 program: patient.program,
                    //                 archived: false, //For a new patient, it will always be false
                    //                 is_active: true, //For a new patient, it will always be true
                    //                 patient_setting_id: responses[1].patient_setting_ID,
                    //                 patient_category_id: responses[0].category
                    //             }, {transaction: m}).catch(err => {
                    //                 return next(createError(err.status || 500, err.message || 'Internal Server Error'));
                    //             }, {transaction: m}).then(record => {
                    //                 res.status(200).send(record);
                    //             });
                    //         }).catch(err => {
                    //             res.status(400).send(err);
                    //         });
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
    
    const getPatientInfo = async function (patientArray) {
        let returnArray = [];
        let patientObject = {};
    
        patientArray.forEach(element => {
            patientObject = formatPatientInfo(element);
            patientObject['PatientRecords'] = [];
            let patientRecord = {};
            element.PatientRecords.forEach(record => {
                patientRecord = getPatientRecord(record);
                patientObject['PatientRecords'].push(patientRecord);
            });
            // It makes more sense for the result to contain records sorted from most recent to oldest
            patientObject['PatientRecords'].reverse();
            returnArray.push(patientObject);
        });
    
        return returnArray;
    };
    
    const getLabel = function(record, patient_number) {
        let label = '';
        if (record.middle_name !== null || record.middle_name !== '') {
            label = record.first_name  + ' ' + record.middle_name + ' ' + record.last_name + ' ( ' + patient_number + ' )';
        } else {
            label = record.first_name  + ' ' + record.last_name + ' ( ' + record.patient_number + ' )';
        }
        return label;
    };
    
    const getPatientRecord = function(record) {
        let patientRecord = {};
        patientRecord['patientRecordId'] = record.patient_record_id;
        patientRecord['admissionDate'] = record.admission_date;
        patientRecord['dischargeDate'] = record.discharge_date;
        patientRecord['comments'] = record.comments;
        patientRecord['diagnosis'] = record.diagnosis;
        patientRecord['program'] = record.program;
        patientRecord['interruptionDays'] = record.interruption_days;
        patientRecord['isActive'] = record.is_active;
        patientRecord['archived'] = record.archived;
        patientRecord['patientId'] = record.patient_id;
        patientRecord['category'] =  Number(record.patient_category_id);
        patientRecord['setting'] =  record.patient_setting_id == 1? 'In Patient': 'Out Patient';
        return patientRecord;
    };
    
    const formatPatientInfo = function(element) {
        let patientObject = {};
        patientObject['userType'] = 'patient';
        patientObject['patientId'] = element.patient_id;
        patientObject['archived'] = element.archived;
        patientObject['patientNumber'] = element.patient_number;
        patientObject['firstName'] = element.UserAccount.first_name;
        patientObject['middleName'] = element.UserAccount.middle_name;
        patientObject['lastName'] = element.UserAccount.last_name;
        patientObject['label'] = getLabel(element.UserAccount, element.patient_number);
        patientObject['contactNumber'] = element.UserAccount.contact_number;
        patientObject['email'] = element.UserAccount.email;
        patientObject['dateOfBirth'] = element.UserAccount.date_of_birth;
        patientObject['createdAt'] = element.UserAccount.createdAt;
        patientObject['updatedAt'] = element.UserAccount.updatedAt;
        
        return patientObject;
    };

    const updateRecordQuery = `
    UPDATE UserAccount, Patient, PatientRecord
    SET
        UserAccount.first_name = $2,
        UserAccount.middle_name = $3,
        UserAccount.last_name = $4,
        UserAccount.contact_number = $5,
        UserAccount.email = $6,
        UserAccount.password = $7,
        Patient.patient_number = $8,
        PatientRecord.program = $9,
        PatientRecord.admission_date = $10,
        PatientRecord.discharge_date = $11,
        PatientRecord.patient_setting_id = $12,
        PatientRecord.patient_category_id = $13,
        PatientRecord.interruption_days = $14,
        PatientRecord.diagnosis = $15,
        PatientRecord.comments = $16,
        UserAccount.date_of_birth = $17
    WHERE
        PatientRecord.patient_record_id = $1
        AND patient.patient_id = PatientRecord.patient_id
        AND UserAccount.user_account_ID = PatientRecord.patient_id;
`;
    return router;
};
// module.exports = router;