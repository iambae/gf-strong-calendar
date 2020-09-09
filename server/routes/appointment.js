'use strict';

// const env = process.env.NODE_ENV;
const path = require('path');
const createError = require('http-errors');
const router = require('express').Router({ mergeParams: true });
const moment = require('moment');
const emailer = require('../email');
const Op = require('sequelize').Op;
// const fs = require('fs');

const models = require(path.join(__dirname, '/../models'));
const sequelize = models.sequelize;

module.exports = function(authenticate) {
    router.get('/', authenticate, async (req, res, next) => {
        models.Appointment.findAll({
            where: {
                cancelled: false,
                archived: false
            },
            include: [{
                model: models.AppointmentUser
            }]
        }).then(async records => {
            const formattedRecords = await formatAppointmentRecords(records);
            res.status(200).send(formattedRecords);
        });
    });
    
    router.get('/:appointment_id', authenticate, async (req, res, next) => {
        const appointmentID = req.params.appointment_id;
    
        if (!appointmentID) {
            return next(createError(400, 'Bad Request: Appointment ID is required.'));
        }
    
        try {
            models.Appointment.findOne({
                where: { appointment_id: appointmentID }
            }).then(appoint => {
                res.status(200).json(appoint);
            }).catch(err => {
                res.status(400).send(err);
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });
    
    // Code for updating appointment
    router.put('/:appointment_id', authenticate, async (req, res, next) => {
        const appointmentID = req.params.appointment_id;
        const appointment = req.body;
    
        if (!appointmentID) {
            return next(createError(400, 'Bad Request: Appointment ID is required.'));
        }

        const patientRecords = models.PatientRecord.findAll({
            where : {
                patient_id: appointment.patients,
                is_active: 1,
                discharge_date: {
                    [Op.or]: {
                        [Op.eq]: null,
                        [Op.gt]: new Date (moment(appointment.start_time).format('YYYY-MM-DD'))
                    }
                },
                admission_date: {
                    [Op.or]: {
                        [Op.lt]: new Date(moment(appointment.start_time).format('YYYY-MM-DD')),
                        [Op.eq]: new Date(moment(appointment.start_time).format('YYYY-MM-DD'))
                    }
                }
            }
        })
            .then(patientRecords => {
                return patientRecords;
            });

        const newAppointment = {appointment_id: appointmentID, start_time: appointment.start_time, end_time: appointment.end_time};
        const conflict = await checkConflicts(newAppointment, appointment.patients, appointment.therapists, true);
        if (conflict) {
            res.status(400).send({CONFLICT: true});
        } else {
            return sequelize.transaction(t => {
                return models.Appointment.update(
                    {
                        start_time: appointment.start_time,
                        end_time: appointment.end_time,
                        cancelled: appointment.cancelled,
                        location_id: appointment.location_id,
                        type_id: appointment.type_id,
                        notes: appointment.notes,
                        archived: appointment.archived
                    },
                    {
                        where:
                            { appointment_id: appointmentID }
                    },
                    {transaction: t}).then(() => {
                    return models.AppointmentUser.destroy({
                        where: {
                            appointment_id: appointmentID
                        }
                    }, {transaction: t}).then(() => {
                        return appointmentUserArray(appointment, patientRecords, appointment.therapists).then(values => {
                            return models.AppointmentUser.bulkCreate(values, {transaction: t}).then(result => {
                                res.status(200).send(result);
                            }, {transaction: t}).catch(err => {
                                res.status(400).send(err);
                            });
                        });
                    });
                });
            });
        }
    });
    
    // TODO: Code for deleting appointment
    router.delete('/:appointment_id', async (req, res, next) => {
        const appointmentID = req.params.appointment_id;
    
        if (!appointmentID) {
            return next(createError(400, 'Bad Request: Appointment ID is required.'));
        }
    
        try {
            await models.Appointment.destroy({
                where: {
                    appointment_id: appointmentID
                }
            });
            res.status(204).send();
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });
    
    // TODO: Create new Appointment
    router.post('/appointment', authenticate, async (req, res, next) => {
        const appointment = req.body;
        if (!appointment.location_id) {
            return next(createError(400, 'Bad Request: Location ID is required to create an appointment.'));
        }
        
        if (!appointment.type_id) {
            return next(createError(400, 'Bad Request: Type ID is required to create an appointment.'));
        }
    
        if (!appointment.patients || appointment.patients.length == 0) {
            return next(createError(400, 'Bad Request: Patients are required to create an appointment'));
        }
        
        if (!appointment.therapists || appointment.therapists.length == 0) {
            return next(createError(400, 'Bad Request: Therapists are required to create an appointment'));
        }
    
        const patientRecords = models.PatientRecord.findAll({
            where : {
                patient_id: appointment.patients,
                is_active: 1,
                discharge_date: {
                    [Op.or]: {
                        [Op.eq]: null,
                        [Op.gt]: new Date (moment(appointment.start_time).format('YYYY-MM-DD'))
                    }
                },
                admission_date: {
                    [Op.or]: {
                        [Op.lt]: new Date(moment(appointment.start_time).format('YYYY-MM-DD')),
                        [Op.eq]: new Date(moment(appointment.start_time).format('YYYY-MM-DD'))
                    }
                }

            }
        })
            .then(patientRecords => {
                return patientRecords;
            });
    
        const location = models.Location.findOne({
            attributes: ['location_id'],
            where: {
                location_id: appointment.location_id
            }
        })
            .then(location => {
                return location;
            });
    
        const type = models.Type.findOne({
            attributes: ['type_id'],
            where: {
                type_id: appointment.type_id
            }
        })
            .then(type => {
                return type;
            });
        const newAppointment = {start_time: appointment.start_time, end_time: appointment.end_time};
        const conflict = await checkConflicts(newAppointment, appointment.patients, appointment.therapists, false);
        if (conflict) {
            res.status(400).send({CONFLICT:true});
        } else {
            Promise.all([location, type, patientRecords]).then(responses => {
                if (responses[2].length == 0) {
                    return res.status(400).send({NO_RECORD_FOUND: true});
                } else {
                    return sequelize.transaction(t => {
                        return models.Appointment.create({
                            start_time: moment(appointment.start_time).format(),
                            end_time: moment(appointment.end_time).format(),
                            location_id: responses[0].location_id,
                            type_id: responses[1].type_id,
                            notes: appointment.notes,
                            cancelled: appointment.cancelled,
                            archived: appointment.archived
                        }, {transaction: t}).then(appoint => {
                            return appointmentUserArray(appoint, responses[2], appointment.therapists).then(values => {
                                return models.AppointmentUser.bulkCreate(values, {transaction: t}).then(result => {
                                    models.UserAccount.findAll({
                                        where: {user_account_ID: appointment.patients}
                                    },
                                    ).then(patientAccounts => {
                                        sendEmails(patientAccounts, appointment).then(() => {
                                            res.status(201).send(result);
                                        });
                                    });
                                }).catch(err => {
                                    res.status(400).send(err);
                                });
                            });
                        });
                    });
                }
            }).catch(err => {
                return next(createError(500, err || 'Internal Server Error'));
            });
        }
    });
    // Send emails to the patients
    const sendEmails = async function(patientAccounts, appointment) {
        patientAccounts.forEach(patient => {
            let info = {
                name: patient.first_name,
                start_time: moment(appointment.start_time).tz('America/Phoenix').format('YYYY-MM-DD HH:mm'),
                end_time: moment(appointment.end_time).tz('America/Phoenix').format('YYYY-MM-DD HH:mm')
            };
            emailer.sendEmail(patient.email, 'appointment_schedule', info);
        });
    };
    
    const appointmentUserArray = async function(appointment_record, patientRecords, therapists) {
        let ret = [];
        let i = 0;
        patientRecords.map(patientRecord => {
            ret[i] = {
                appointment_id: appointment_record.appointment_id,
                user_id: patientRecord.patient_id,
                patient_record_id: patientRecord.patient_record_id,
                no_show: false,
                archived: false
            };
            i++;
        });
    
        therapists.forEach(therapist => {
            ret[i] = {
                appointment_id: appointment_record.appointment_id,
                user_id: therapist,
                no_show: false,
                archived: false
            };
            i++;
        });
    
        return ret;
    };
    
    // get all appointments for a user, 
    router.get('/user/:user_id', (req, res, next) => {
    
        models.AppointmentUser.findAll({
            where: {
                user_id: req.params.user_id,
            },
            attributes: ['appointment_id']
        }).then((appointmentUserRecords) => {
            const appointmentIds = appointmentUserRecords.map(a => a.appointment_id);
            models.Appointment.findAll({
                where: {
                    appointment_id: appointmentIds,
                    cancelled: false,
                    archived: false
                },
                include: [{
                    model: models.AppointmentUser
                }]
            }).then(async records => {
                const formattedRecords = await formatAppointmentRecords(records);
                res.status(200).send(formattedRecords);
            });
        });
    });

    // Check conflicts main function
    const checkConflicts = async function(appointmentInfo, patientIds, therapistIds, update) {
        for (let id of patientIds) {
            let appointmentRecords = await getPatientAppointmentTimes(id);
            appointmentRecords.map((curr, index) => {
                appointmentRecords[index] = curr.dataValues;
            });
            if (update === true) {
                appointmentRecords = appointmentRecords.filter( el => el.appointment_id != appointmentInfo.appointment_id );
            }

            // Filtering out the current appointmentId to check for conflicts
            let noConflict = compareAppointmentTime(appointmentRecords, appointmentInfo);
            if (!noConflict == true) {
                return true;
            }
        }

        for (let id of therapistIds) {
            let appointmentRecords = await getTherapistAppointmentTimes(id, appointmentInfo, update);
            appointmentRecords.map((curr, index) => {
                appointmentRecords[index] = curr.dataValues;
            });

            // Filtering out the current appointmentId to check for conflicts
            if (update === true) {
                appointmentRecords = appointmentRecords.filter( el => el.appointment_id != appointmentInfo.appointment_id );
            }
            let noConflict = compareAppointmentTime(appointmentRecords, appointmentInfo);
            if (!noConflict == true) {
                return true;
            }
        }

        return false;
    };

    // Get all active appointments for patients specified in the users
    const getPatientAppointmentTimes = function(patientId, appointmentInfo, update) {

        if (!update) {
            return models.PatientRecord.findOne({
                where: {
                    patient_id: patientId,
                    is_active: true
                }
            }).then(record => {
                return models.AppointmentUser.findAll({
                    where: {
                        user_id: record.patient_id,
                        patient_record_id: record.patient_record_id
                    },
                    attributes: ['appointment_id']
                }).then(appointments => {
                    const appoints = appointments.map(app => app.appointment_id);
                    return models.Appointment.findAll({
                        where: {
                            appointment_id: appoints,
                            cancelled: false
                        },
                        attributes: ['appointment_id', 'start_time', 'end_time']
                    });
                });
            });
        } else {
            // If trying to update the appointment, then remove the appointment id
            // of the appointment we are trying to update
            return models.PatientRecord.findOne({
                where: {
                    patient_id: patientId,
                    is_active: true
                }
            }).then(record => {
                return models.AppointmentUser.findAll({
                    where: {
                        user_id: record.patient_id,
                        patient_record_id: record.patient_record_id
                    },
                    attributes: ['appointment_id']
                }).then(appointments => {
                    let appoints = appointments.map(app => app.appointment_id);
                    appoints  = appoints.filter( el => el !== appointmentInfo.appointment_id );
                    return models.Appointment.findAll({
                        where: {
                            appointment_id: appoints,
                            cancelled: false
                        },
                        attributes: ['appointment_id', 'start_time', 'end_time']
                    });
                });
            });
        }
        
    };

    // Getting therapist appointment times to check for conflicts
    const getTherapistAppointmentTimes = function(therapistId, appointmentInfo, update) {
        if (!update) {
            return models.AppointmentUser.findAll({
                where: {
                    user_id: therapistId
                },
                attributes: ['appointment_id']
            }).then(appointments => {
                const appoints = appointments.map(app => app.appointment_id);
                return models.Appointment.findAll({
                    where: {
                        appointment_id: appoints,
                        cancelled: false
                    },
                    attributes: ['appointment_id','start_time', 'end_time']
                });
            });
        } else {
            return models.AppointmentUser.findAll({
                where: {
                    user_id: therapistId
                },
                attributes: ['appointment_id']
            }).then(appointments => {
                let appoints = appointments.map(app => app.appointment_id);
                appoints  = appoints.filter( el => el !== appointmentInfo.appointment_id );
                return models.Appointment.findAll({
                    where: {
                        appointment_id: appoints,
                        cancelled: false
                    },
                    attributes: ['appointment_id','start_time', 'end_time']
                });
            });
        }
    };

    const compareAppointmentTime = function(appointments, appointmentInfo) {
        let noConflict = true;
        for (var appoint of appointments) {
            // if start time of the new appointment is after a scheduled appointment start time, but the new start time is before the scheduled end time
            if (moment(appointmentInfo.start_time).isAfter(appoint.start_time) && (!moment(appointmentInfo.start_time).isAfter(appoint.end_time) && !moment(appointmentInfo.start_time).isSame(appoint.end_time))) {
                noConflict = false;
                break;
            }

            // if start time of the new appointment is before a scheduled appointment start time, but the new end time is after the scheduled end time
            if (moment(appointmentInfo.start_time).isBefore(appoint.start_time) && (!moment(appointmentInfo.end_time).isBefore(appoint.start_time)) && !moment(appointmentInfo.end_time).isSame(appoint.start_time)) {
                noConflict = false;
                break;
            }

            // if start time of the new appointment is the same as scheduled start time
            if (moment(appointmentInfo.start_time).isSame(appoint.start_time)) {
                noConflict = false;
                break;
            }

            // if end time of the scheduled appointment is the same as scheduled end time
            if (moment(appointmentInfo.end_time).isSame(appoint.end_time)) {
                noConflict = false;
                break;
            }
        }
        return noConflict;
    };

    // Format to work with the rendering function 
    const formatAppointmentRecords = async function(records) {
        let appointments = [];
        let appointmentObject = {};
        records.forEach(record => {
            appointmentObject = {};
            let info = getInformation(record.AppointmentUsers);
            appointmentObject['therapists'] = info.therapists;
            appointmentObject['patients'] = info.patients;
            appointmentObject['locationId'] = record.location_id;
            appointmentObject['typeId'] = record.type_id;
            appointmentObject['startTime'] = record.start_time;
            appointmentObject['endTime'] = record.end_time;
            appointmentObject['appointmentId'] = record.appointment_id;
            appointmentObject['notes'] = record.notes;

            appointments.push(appointmentObject);
        });
        return appointments;
    };

    // Getting all the patient and therapist idså
    const getInformation = function(appointmentUsers) {
        let patientIds = [];
        let therapistIds = [];

        // Populate he patient and therapist names
        appointmentUsers.forEach(user => {
            if (user.patient_record_id !== null) {
                patientIds.push(user.user_id);
            } else {
                therapistIds.push(user.user_id);
            }
        });

        return {patients: patientIds, therapists: therapistIds};
    };
    return router;
};