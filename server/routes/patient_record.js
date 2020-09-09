// Endpoints only for admins
'use strict';

// const env = process.env.NODE_ENV;
const path = require('path');
const createError = require('http-errors');

const router = require('express').Router({ mergeParams: true });
const models = require(path.join(__dirname, '/../models'));
const sequelize = models.sequelize;
const Op = require('sequelize').Op;

const bcrypt = require('bcrypt');
const saltRounds = 12;

module.exports = function(authenticate) {
    router.get('/patient_records', authenticate, async (req, res, next) => {
        try {
            models.PatientRecord.all().then(records => {
                res.status(200).send(JSON.stringify(records));
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });
    
    // Code for updating a patient record
    router.put('/patient_record/:record_id', authenticate, async (req, res, next) => {
        const recordID = req.params.record_id;
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
                            record.interruption_days, record.diagnosis, record.comments
                        ],
                        raw: true,
                        type: sequelize.QueryTypes.UPDATE
                    }).then(() => {
                        res.status(200).send('Successfully updated patient record');
                    }).catch(err => {
                        res.status(400).send('Email must be unique');
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
                        record.interruption_days, record.diagnosis, record.comments
                    ],
                    type: sequelize.QueryTypes.UPDATE
                }).then(result => {
                    res.status(200).send('Successfully updated patient record');
                }).catch(err => {
                    res.status(400).send('Email must be unique');
                });
            }
        }).catch(err => {
            res.status(500).send(err);
        });
    });

    router.put('/archive/:record_id', authenticate, async (req, res, next) => {
        const recordID = req.params.record_id;

        if (!recordID) {
            return next(createError(400, 'Bad Request: Record ID is required.'));
        }

        models.PatientRecord.update({
            archived: true
        }, {
            where: {
                patient_record_id: recordID
            }
        }).then(() => {
            res.status(200).send({message: 'Successfully archived patient record'});
        }).catch(err => {
            res.status(500).send(err);
        });
    });
    
    router.get('/patient_record/:record_id', authenticate, async (req, res, next) => {
        const recordID = req.params.record_id;
    
        if (!recordID) {
            return next(createError(400, 'Bad Request: Patient Record ID is required.'));
        }
    
        try {
            models.PatientRecord.findOne({
                where: {
                    patient_record_ID: recordID
                }
            }).then(record => {
                res.status(200).send(record);
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });
    
    // get the active PatientRecord for a given patient
    router.get('/active/:patient_id', authenticate, async (req, res, next) => {
        const patientID = req.params.patient_id;
    
        if (!patientID) {
            return next(createError(400, 'Bad Request: Patient ID is required.'));
        }
    
        try {
            models.PatientRecord.findOne({
                where: {
                    patient_id: patientID,
                    is_active: true,
                },
                order: [ [ 'admission_date', 'DESC' ]],
            })
                .then(patientRecord => {
                    res.status(200).json(patientRecord);
                });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });
    
    // Create new Patient Record
    router.post('/patient_record', authenticate, async (req, res, next) => {
        const patient_record = req.body;
        if (!patient_record.category) {
            res.status(400).send('Bad Request: Patient Category is a required field');
        }
    
        if (!patient_record.setting) {
            res.status(400).send('Bad Request: Patient Setting is a required field');
        }
        const patientCategory = models.PatientCategory.findOne({ where: { category: patient_record.category } });
        const patientSetting = models.PatientSetting.findOne({ where: { setting_type: patient_record.setting } });
    
        Promise.all([patientCategory, patientSetting]).then(responses => {
            models.PatientRecord.findAll({
                where: {
                    patient_id: patient_record.patient_id,
                    is_active: true
                },
                order: [
                    ['admission_date', 'DESC']
                ]
            }).then(records => {
                records = transformQueryResultToArray(records);
                if (records.length !== 0) {
                    if (records[0].discharge_date > patient_record.admission_date || records[0].discharge_date == null) {
                        return res.status(400).send({ ACTIVE_RECORD: true, CREATED: false });
                    } else {
                        return models.PatientRecord.create({
                            patient_id: patient_record.patient_id,
                            admission_date: patient_record.admission_date,
                            discharge_date: patient_record.discharge_date,
                            comments: patient_record.comments,
                            program: patient_record.program,
                            archived: 0,
                            patient_setting_id: responses[1].patient_setting_ID,
                            patient_category_id: responses[0].category,
                            diagnosis: patient_record.diagnosis,
                            interruption_days: patient_record.interruption_days,
                            is_active: 1
                        }).then(record => {
                            return models.PatientRecord.update({is_active: false }, {
                                where: {
                                    patient_id: record.patient_id,
                                    patient_record_id: {
                                        [Op.ne]: record.patient_record_id
                                    }
                                }
                            }).then(() => {
                                res.status(204).send({SUCCESS: true});
                            }).catch(err => {
                                res.status(500).send(err);
                            });
                        }).catch(err => {
                            res.status(500).send(err);
                        });
                    }
                } else {
                    res.status(500).send({message: 'Patient has no active records'});
                }
            });
        }).catch(err => {
            res.status(500).send(err);
        });
    });
    return router;
};

// Converts the query result object to a simple array of records
const transformQueryResultToArray = function(records) {
    if (!records) {return [];}

    let result = [];
    records.map(record => {
        result.push(record['dataValues']);
    });
    return result;
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
        PatientRecord.comments = $16
    WHERE
        PatientRecord.patient_record_id = $1
        AND patient.patient_id = PatientRecord.patient_id
        AND UserAccount.user_account_ID = PatientRecord.patient_id;
`;
