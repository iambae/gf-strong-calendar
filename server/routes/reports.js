'use strict';

const path = require('path');
const createError = require('http-errors');

const router = require('express').Router({mergeParams: true});

const models = require(path.join(__dirname, '/../models'));

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config.json')[env];
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.database, config.username, config.password, config);

module.exports = function(authenticate) {
    /*
    Support Personnel Report

    Get all the supporting stuff for a given patient, based on the patient's appointments.
    grouping is all the therapy types provided by a therapist, based on his.her appointments with the patient

    Returned object format:
    {
        "name": "Patient Name"
        "staff": [
            { "name": "Staff 1 Name", "code": "code1", "grouping": ["type"]},
            { "name": "Staff 2 Name", "code": "code2", "grouping": ["type1", "type2"]},
            ...
        ]
    }
 */
    router.get('/support-staff/:patient_id', async (req, res, next) => {
        const patientID = req.params.patient_id;

        if (!patientID) {
            return next(createError(400, 'Bad Request: Patient ID is required.'));
        }

        try {
            // Get Patient Name (also verifies that a patient with the given ID exists)
            const patientName = models.UserAccount.findOne({
                where : { user_account_ID: patientID },
                include: [{
                    model: models.Patient,
                    required: true
                }]
            }).then(user => {
                return combineFullName(user.first_name, user.middle_name, user.last_name);
            }).catch(err => {
                console.log(err);
                res.status(400).send('Patient with a patient ID of ' + patientID + ' was not found.');
            });

            // Get all support staff
            const supportStaff = sequelize.query(supportStaffQuery,
                { bind: [patientID], raw: true, type: sequelize.QueryTypes.SELECT }
            ).then(results => {
                let staff = [];

                // build a map of therapistID -> [ types ]
                let therapistToType = new Map();
                results.forEach(row => {
                    let therapist = row['id'];
                    let type = row['type'];
                    if (therapistToType.has(therapist)) {
                        therapistToType.get(therapist).add(type);
                    } else {
                        therapistToType.set(therapist, new Set([type]));
                    }
                });

                let prevID = -1; // use the fact that the result is sorted by ID
                results.forEach(row => {
                    if (prevID === row['id']) {
                        return; // skip this row, move to the next one
                    }
                    prevID = row['id'];
                    let staffRecord = {};
                    staffRecord['name'] = combineFullName(row['fName'], row['mName'], row['lName']);
                    staffRecord['code'] = row['code'];
                    staffRecord['grouping'] = Array.from(therapistToType.get(row['id']));
                    staff.push(staffRecord);
                });

                return staff;
            });

            Promise.all([patientName, supportStaff]).then(results => {
                let response = {};
                response['name'] = results[0];
                response['staff'] = results[1];
                res.status(200).json(response);
            });

        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });


    /*
    Patient Therapy Intensity Report

    Returned object format:
    ***** NOTE: "total" will be missing if there is only 1 patient record (intentionally)
    {
        "patient_name": "Patient Full Name"
        "patient_records": [
            {
                "record_id": 5,
                "category": 2,
                "admission_date": "29/10/1995",
                "discharge_date": "29/10/2000",
                "total_ot_hours": 34,
                "total_speech_hours": 21,
                "total_rec_hours": 76,
                "total_hours": 131,
                "average_ot_hours": 5,
                "average_speech_hours": 4,
                "average_rec_hours": 7,
                "average_total_hours": 5
            },
            ...
        ],
        "total": {
            "total_ot_hours": 34,
            "total_speech_hours": 21,
            "total_rec_hours": 76,
            "total_hours": 131,
            "average_ot_hours": 5,
            "average_speech_hours": 4,
            "average_rec_hours": 7,
            "average_total_hours": 5
        }
    }
 */
    router.get('/intensity/:patient_id', authenticate, async (req, res, next) => {
        const patientID = req.params.patient_id;

        if (!patientID) {
            return next(createError(400, 'Bad Request: Patient ID is required.'));
        }

        try {
        // Get Patient Name (also verifies that a patient with the given ID exists)
            const patientName = models.UserAccount.findOne({
                where : { user_account_ID: patientID },
                include: [{
                    model: models.Patient,
                    required: true
                }]
            }).then(user => {
                return combineFullName(user.first_name, user.middle_name, user.last_name);
            }).catch(err => {
                console.log(err);
                res.status(400).send('Patient with a patient ID of ' + patientID + ' was not found.');
            });

            // Get all PatientRecords for the given patient
            const patientRecords = models.PatientRecord.findAll({
                where: {
                    patient_id: patientID,
                    archived: 0
                },
                order: [['admission_date','DESC']]
            }).then(patientRecords => {
                return patientRecords;
            });

            Promise.all([patientName, patientRecords]).then(results => {
                let response = {};
                response['patient_name'] = results[0];

                // Get mapping of recordID -> { info }
                const recordToInfo = new Map();
                results[1].forEach(record => {
                    recordToInfo.set(record.patient_record_id, {
                        record_id: record.patient_record_id,
                        category: record.patient_category_id,
                        admission_date: record.admission_date,
                        discharge_date: record.discharge_date,
                        interruption_days: record.interruption_days
                    });
                });

                // Run the intensity Query
                const intensity = sequelize.query(intensityQuery,
                    {bind: [patientID], raw: true, type: sequelize.QueryTypes.SELECT}
                ).then(queryResult => {
                    return queryResult;
                });

                // Get total hours from query for all records
                Promise.all([intensity]).then(results => {
                    results[0].forEach(result => {
                        let rec = recordToInfo.get(result.record_id);
                        if (result.code === 'OT') {
                            rec['total_ot_hours'] = Number(result.total);
                        } else if (result.code === 'Speech') {
                            rec['total_speech_hours'] = Number(result.total);
                        } else if (result.code === 'REC') {
                            rec['total_rec_hours'] = Number(result.total);
                        }
                    });

                    let records = [];

                    // Set total hours to 0 for each record if patient didn't have any appointments of any of the types
                    // i.e. fill in any missing information if query didn't find data for it
                    for (let [k, val] of recordToInfo) {
                        if (!val['total_ot_hours']) {
                            val['total_ot_hours'] = 0;
                        }
                        if (!val['total_speech_hours']) {
                            val['total_speech_hours'] = 0;
                        }
                        if (!val['total_rec_hours']) {
                            val['total_rec_hours'] = 0;
                        }
                        val['total_hours'] = val['total_ot_hours'] + val['total_speech_hours'] + val['total_rec_hours'];
                        records.push(val);
                    }


                    // Calculate averages for each record, per work day
                    records.forEach(record => {
                        let admissionDate = record.discharge_date ? new Date(record.discharge_date) : null;
                        let daysIn = getBusinessDays(new Date(record.admission_date), admissionDate);
                        daysIn = daysIn - Number(record.interruption_days);
                        // if patient was admitted and discharged on the weekend, count it as 1 day (i.e. can't divide by 0)
                        // Similarly if interruption_days > patient duration (this shouldn't happen), count it as one day
                        if (daysIn <= 0) {
                            daysIn = 1;
                        }
                        record['average_ot_hours'] = record['total_ot_hours'] / daysIn;
                        record['average_speech_hours'] = record['total_speech_hours'] / daysIn;
                        record['average_rec_hours'] = record['total_rec_hours'] / daysIn;
                        record['average_total_hours'] = (record['average_ot_hours'] + record['average_speech_hours'] + record['average_rec_hours']) / 3.0;

                        // Rewrite date in desired format:
                        record['admission_date'] = formatDate(record.admission_date);
                        record['discharge_date'] = formatDate(record.discharge_date);
                    });

                    response['patient_records'] = records;

                    let numRecords = records.length;
                    if (numRecords <= 1) {
                        return response;
                    }

                    // If more than 1 record, Calculate total for all records
                    let total = {};
                    total['total_hours'] = 0;
                    total['total_ot_hours'] = 0;
                    total['total_speech_hours'] = 0;
                    total['total_rec_hours'] = 0;
                    total['average_total_hours'] = 0;
                    total['average_ot_hours'] = 0;
                    total['average_rec_hours'] = 0;
                    total['average_speech_hours'] = 0;

                    records.forEach(record => {
                        total['total_hours'] += record['total_hours'];
                        total['total_ot_hours'] += record['total_ot_hours'];
                        total['total_speech_hours'] += record['total_speech_hours'];
                        total['total_rec_hours'] += record['total_rec_hours'];
                        total['average_total_hours'] += record['average_total_hours'];
                        total['average_ot_hours'] += record['average_ot_hours'];
                        total['average_rec_hours'] += record['average_rec_hours'];
                        total['average_speech_hours'] += record['average_speech_hours'];
                    });

                    total['average_ot_hours'] = total['average_ot_hours'] / numRecords;
                    total['average_speech_hours'] = total['average_speech_hours'] / numRecords;
                    total['average_rec_hours'] = total['average_rec_hours'] / numRecords;
                    total['average_total_hours'] = total['average_total_hours'] / numRecords;

                    response['total'] = total;

                    return response;
                }).then(response => {
                    res.status(200).send(response);
                }).catch(err => {
                    return next(createError(500, err));
                });
            }).catch(err => {
                return next(createError(500, err));
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });


    /*

    Patient Therapy Report

    {
        "name": "Patient Name",
        "therapies": [
            {
                "type": "PT",
                "average_minutes": 7,
                "total_minutes": 64
            },
            {
                "type": "OTRA",
                "average_minutes": 2,
                "total_minutes": 7
            },
            ...
        ]
    }
 */
    router.get('/therapy/:patient_id', async (req, res, next) => {
        const patientID = req.params.patient_id;

        if (!patientID) {
            return next(createError(400, 'Bad Request: Patient ID is required.'));
        }

        let startDate = new Date(req.query.startDate);
        let endDate = new Date(req.query.endDate);

        let isTimeRange = req.query.startDate && req.query.endDate && isValidDate(startDate) && isValidDate(endDate);

        if (!isTimeRange) {
            startDate = null;
            endDate = null;
        }

        try {
        // Get Patient Name (also verifies that a patient with the given ID exists)
            const patientName = models.UserAccount.findOne({
                where : { user_account_ID: patientID },
                include: [{
                    model: models.Patient,
                    required: true
                }]
            }).then(user => {
                return combineFullName(user.first_name, user.middle_name, user.last_name);
            }).catch(err => {
                console.log(err);
                res.status(400).send('Patient with a patient ID of ' + patientID + ' was not found.');
            });

            // Only want to include records within the startDate / endDate
            const patientDuration = models.PatientRecord.findAll({
                where: { patient_id: patientID, archived: 0}
            }).then(records => {
                return records.reduce((total, curr) => {
                    let start = new Date(curr.admission_date);
                    let end = new Date(curr.discharge_date);

                    if (!curr.discharge_date || !end || !isValidDate(end)) {
                        end = endDate;
                    }

                    if (isTimeRange) {
                    // record is out of range, skip it
                        if (start.getTime() > endDate.getTime() || end.getTime() < startDate.getTime()) {
                            return total;
                        }

                        // If admission date is before startDate, shift it
                        if (start.getTime() < startDate.getTime()) {
                            start = startDate;
                        }

                        // If discharge date is after endDate, shift it
                        if (end.getTime() > endDate.getTime()) {
                            end = endDate;
                        }
                    }
                    return total + Math.min(1, getBusinessDays(start, end) - Number(curr.interruption_days));
                }, 0);
            }).catch(err => {
                res.status(500).send(err);
            });

            Promise.all([patientName, patientDuration]).then(results => {
                let response = {};
                response['patient_name'] = results[0];

                let duration = results[1];

                // If duration is 0, patient didn't have any appointments in the given time range
                if (duration == 0) {
                    response['therapies'] = [];
                    res.status(200).send(response);
                } else {
                    // Run the therapy Query
                    sequelize.query(therapyQuery,
                        {bind: [patientID, startDate, endDate], raw: true, type: sequelize.QueryTypes.SELECT}
                    ).then(queryResult => {
                        let therapies = [];
                        queryResult.forEach(row => {
                            let therapy = {};
                            therapy['type'] = row.code;
                            therapy['total_minutes'] = Number(row.total);
                            therapy['average_minutes'] = Number(row.total) / duration;
                            therapies.push(therapy);
                        });

                        response['therapies'] = therapies;
                        res.status(200).send(response);
                    }).catch(err => {
                        res.status(500).send(err);
                    });
                }
            }).catch(err => {
                res.status(500).send(err);
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });



    /*

    Aggregate Report

    {
        "category": 1,
        "patients": {
            "raw": 45,
            "percent": 33
        },
        "diagnosis": {
            "stroke": 1500,
            "tbi": 1000,
            "other": 500
        },
        "length_of_stay": {
            "total": 3000,
            "median": 90,
            "average": 91
        },
        "intensity": {
            "PT":    { "median_min": 60, "average_min": 60 },
            "PT RA": { "median_min": 60, "average_min": 60 },
            "OT":    { "median_min": 60, "average_min": 60 },
            "OT RA": { "median_min": 60, "average_min": 60 },
            "SLP":   { "median_min": 60, "average_min": 60 },
            "SLPA":  { "median_min": 60, "average_min": 60 }
        },
        "total_intensity": {
            "median_min": 60,
            "average_min": 60
        },
        "appointments": {
            "PT":    { "median_attended": 60, "median_missed": 60 },
            "PT RA": { "median_attended": 60, "median_missed": 60 },
            "OT":    { "median_attended": 60, "median_missed": 60 },
            "OT RA": { "median_attended": 60, "median_missed": 60 },
            "SLP":   { "median_attended": 60, "median_missed": 60 },
            "SLPA":  { "median_attended": 60, "median_missed": 60 }
        }
    }

    TODO Assumptions:
        - Patient records are considered as separate patients (from Piazza #234)
        - "total" median / average: only of those 6, with EQUAL weights (i.e. median of medians, average of averages)
        - don't count cancelled / no-show appointments
        - calculated length of stay is NOT effected by given time range
 */
    router.get('/aggregate/:category', authenticate, async (req, res, next) => {
        const category = req.params.category;

        if (!category) {
            return next(createError(400, 'Bad Request: Category is required.'));
        }

        // let startDate = new Date(new Date(req.query.startDate).getTime() - VancouverUTCTimeOffset);
        let startDate = new Date(req.query.startDate);
        let endDate = new Date(req.query.endDate);

        // If one of those are missing, default to fiscal year
        if (!req.query.startDate || !req.query.endDate || !isValidDate(startDate) || !isValidDate(endDate)) {
            startDate = getFiscalYearStart(new Date());
            endDate = getFiscalYearEnd(new Date());
        }

        endDate.setHours(23, 59, 59, 999);

        try {

            // Run aggregate Patient Count query
            const patientCountResult = sequelize.query(aggregatePatientCountQuery,
                {bind: [category, startDate, endDate], raw: true, type: sequelize.QueryTypes.SELECT}
            ).then(queryResult => {
                return queryResult;
            });

            // Run aggregate Diagnosis query
            const diagnosisResult = sequelize.query(aggregateDiagnosisQuery,
                {bind: [category, startDate, endDate], raw: true, type: sequelize.QueryTypes.SELECT}
            ).then(queryResult => {
                return queryResult;
            });

            // Run aggregate Length of Stay query
            const lengthOfStayResult = sequelize.query(aggregateLengthOfStayQuery,
                {bind: [category, startDate, endDate], raw: true, type: sequelize.QueryTypes.SELECT}
            ).then(queryResult => {
                return queryResult;
            });

            // Run aggregate Intensity query
            const intensityResult = sequelize.query(aggregateIntensityQuery,
                {bind: [category, startDate, endDate], raw: true, type: sequelize.QueryTypes.SELECT}
            ).then(queryResult => {
                return queryResult;
            });

            // Run aggregate Appointments query
            const appointmentsResult = sequelize.query(aggregateAppointmentsQuery,
                {bind: [category, startDate, endDate], raw: true, type: sequelize.QueryTypes.SELECT}
            ).then(queryResult => {
                return queryResult;
            });

            Promise.all([patientCountResult, diagnosisResult, lengthOfStayResult, intensityResult, appointmentsResult]).then(results => {
                let patientCount =  results[0];
                let diagnosis =     results[1];
                let lengthOfStay =  results[2];
                let intensity =     results[3];
                let appointments =  results[4];

                let response = {};
                response['category'] = Number(category);
                response['patients'] = extractPatientCountObject(patientCount[0]);
                response['diagnosis'] = extractDiagnosisObject(diagnosis);
                response['length_of_stay'] = extractLengthOfStayObject(lengthOfStay);
                response['intensity'] = extractIntensityObject(intensity);
                response['total_intensity'] = extractTotalIntensityObject(response['intensity']);
                response['appointments'] = extractAppointmentsObject(appointments);

                res.status(200).send(response);
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });



    /*
    ----------------------------------------------------------------
                HELPERS
    ----------------------------------------------------------------
 */


    // Helpers for aggregate query:
    const extractAppointmentsObject = function(appointments) {
        let obj = {};

        // Build maps
        const typeAttendedMap = new Map();
        const typeMissedMap = new Map();
        appointments.forEach(row => {
            let type = row.type;
            let attended = row.attended;
            let missed = row.missed;

            if (typeAttendedMap.has(type)) {
                typeAttendedMap.get(type).push(attended);
            } else {
                typeAttendedMap.set(type, [attended]);
            }

            if (typeMissedMap.has(type)) {
                typeMissedMap.get(type).push(missed);
            } else {
                typeMissedMap.set(type, [missed]);
            }
        });

        // typeAttendedMap and typeMissedMap would have the same keys
        for (let [key, val] of typeAttendedMap) {
            let medianAttended = 0;
            let medianMissed = 0;

            val.sort();
            typeMissedMap.get(key).sort();

            if (val.length !== 0) {
                if (val.length % 2 === 0) {
                    let leftIndex = Math.floor(val.length / 2) - 1;
                    let rightIndex = Math.floor(val.length / 2);
                    medianAttended =  Number((val[leftIndex] + val[rightIndex]) / 2.0);
                    medianMissed =  Number((typeMissedMap.get(key)[leftIndex] + typeMissedMap.get(key)[rightIndex]) / 2.0);
                } else {
                    medianAttended = Number(val[Math.floor(val.length / 2)]);
                    medianMissed = Number(typeMissedMap.get(key)[Math.floor(val.length / 2)]);
                }
            }

            obj[key] = {
                median_attended: medianAttended,
                median_missed: medianMissed
            };
        }

        // Fill missing:
        if (!obj['PT']) {
            obj['PT'] = { median_attended: 0, median_missed: 0 };
        }
        if (!obj['PT RA']) {
            obj['PT RA'] = { median_attended: 0, median_missed: 0 };
        }
        if (!obj['OT']) {
            obj['OT'] = { median_attended: 0, median_missed: 0 };
        }
        if (!obj['OT RA']) {
            obj['OT RA'] = { median_attended: 0, median_missed: 0 };
        }
        if (!obj['SLP']) {
            obj['SLP'] = { median_attended: 0, median_missed: 0 };
        }
        if (!obj['SLPA']) {
            obj['SLPA'] = { median_attended: 0, median_missed: 0 };
        }

        return obj;
    };

    const extractTotalIntensityObject = function(intensityObj) {
        let obj = {};

        let medians = [];
        let averagesSum = 0;
        let count = 0;
        for (let key in intensityObj) {
            if (!intensityObj.hasOwnProperty(key)) {
                continue;
            }
            medians.push(intensityObj[key].median_min);
            averagesSum += intensityObj[key].average_min;
            count++;
        }

        if (count === 0) {
            obj['average_min'] = 0;
            obj['median_min'] = 0;
            return obj;
        }

        obj['average_min'] = averagesSum / count;

        medians.sort();

        if (count % 2 === 0) {
            let left = medians[Math.floor(count / 2) - 1];
            let right = medians[Math.floor(count / 2)];
            obj['median_min'] = (left + right) / 2.0;
        } else {
            obj['median_min'] = medians[Math.floor(count / 2)];
        }

        return obj;
    };

    // Assumes sorted by type, intensity
    const extractIntensityObject = function(intensity) {
        let obj = {};

        // Build map
        const typeMap = new Map();
        intensity.forEach(row => {
            let type = row.type;
            let val = row.intensity;
            if (typeMap.has(type)) {
                typeMap.get(type).push(val);
            } else {
                typeMap.set(type, [val]);
            }
        });

        for (let [key, val] of typeMap) {
            let average = 0;
            let median = 0;
            if (val.length !== 0) {
            // average:
                let sum = val.reduce((acc, curr) => { return acc + curr; }, 0);
                average = sum / val.length;

                // median:
                if (val.length % 2 === 0) {
                    let left = val[Math.floor(val.length / 2) - 1];
                    let right = val[Math.floor(val.length / 2)];
                    median =  (left + right) / 2.0;
                } else {
                    median = val[Math.floor(val.length / 2)];
                }
            }

            obj[key] = {
                median_min: average,
                average_min: median
            };
        }

        // Fill missing:
        if (!obj['PT']) {
            obj['PT'] = { median_min: 0, average_min: 0 };
        }
        if (!obj['PT RA']) {
            obj['PT RA'] = { median_min: 0, average_min: 0 };
        }
        if (!obj['OT']) {
            obj['OT'] = { median_min: 0, average_min: 0 };
        }
        if (!obj['OT RA']) {
            obj['OT RA'] = { median_min: 0, average_min: 0 };
        }
        if (!obj['SLP']) {
            obj['SLP'] = { median_min: 0, average_min: 0 };
        }
        if (!obj['SLPA']) {
            obj['SLPA'] = { median_min: 0, average_min: 0 };
        }

        return obj;

    };

    // Assumes durations are sorted
    const extractLengthOfStayObject = function(lengthOfStay) {
        let obj = {};

        let count = 0;
        let total = 0;

        lengthOfStay.forEach(row => {
            count++;
            total += row.duration;
        });

        if (count === 0) {
            obj['total'] = 0;
            obj['average'] = 0;
            obj['median'] = 0;
            return obj;
        }

        obj['total'] = total;
        obj['average'] = total / count;

        // Calculate median
        if (count % 2 === 0) {
            let left = Math.floor(count / 2) - 1;
            let right = Math.floor(count / 2);
            obj['median'] = (lengthOfStay[left].duration + lengthOfStay[right].duration) / 2.0;
        } else {
            obj['median'] = lengthOfStay[Math.floor(count / 2)].duration;
        }

        return obj;
    };

    const extractDiagnosisObject = function(diagnosis) {
        let obj = {};
        diagnosis.forEach(row => {
            obj[row.diagnosis] = row.count;
        });

        if (!obj['stroke']) {
            obj['stroke'] = 0;
        }

        if (!obj['tbi']) {
            obj['tbi'] = 0;
        }

        if (!obj['other']) {
            obj['other'] = 0;
        }

        return obj;
    };

    const extractPatientCountObject = function(patientCount) {
        let obj = {};
        obj['raw'] = Number(patientCount.raw);
        obj['percent'] = Number(patientCount.percent);
        return obj;
    };

    // Checks if date is valid
    const isValidDate = function(date) {
        return date instanceof Date && !isNaN(date);
    };

    /*
    Get the starting date of the fiscal year
    Assumes fiscal Year starts at April 1st 00:00
 */
    const getFiscalYearStart = function(date) {
        const year = date.getFullYear();
        const april = 3;
        if (date.getMonth() >= april) {
            // Set to April 1st of current year
            date.setFullYear(year, april, 1);
        } else {
            // Set to April 1st of last year
            date.setFullYear(year-1, april, 1);
        }

        date.setHours(0, 0, 0, 0);
        return date;
    };

    /*
        Get the ending date of the fiscal year
        Assumes fiscal Year ends at March 31st 23:59
    */
    const getFiscalYearEnd = function(date) {
        const january = 0;
        const march = 2;
        if (date.getMonth() >= january && date.getMonth() <= march) {
            // Set to March 31st of current year
            date.setFullYear(date.getFullYear(), march, 31);
        } else {
            // Set to March 31st of next year
            date.setFullYear(date.getFullYear()+1, march, 31);
        }
        date.setFullYear(date.getFullYear(), march, 31);
        date.setHours(23, 59, 59, 999);
        return date;
    };

    /*
        Get the business days between two dates.
        This calculation correctly excludes weekends, but NOT holidays
        If endDate is not valid / NULL (no discharge date), set endDate to today
    */
    const getBusinessDays = function(startDate, endDate) {
        let start = new Date(startDate.getTime());
        let end = null;
        if (!endDate || !isValidDate(endDate)) {
            end = new Date();
        } else {
            end = new Date(endDate.getTime());
        }

        let count = 0;
        let curDate = start;
        while (curDate <= end) {
            let dayOfWeek = curDate.getDay();
            if (dayOfWeek !== 6 && dayOfWeek !== 0) {
                count++;
            }
            curDate.setDate(curDate.getDate() + 1);
        }
        return count;
    };


    /*
    Format date in the format of "YYYY/MM/DD"
    If date is null, return "N/A"
*/
    const formatDate = function(date) {
        if (!date) {
            return 'N/A';
        }

        date = new Date(date);
        if (!isValidDate(date)) {
            return 'N/A';
        }

        let day = date.getDate();
        let month = date.getMonth() + 1; // month is 0-based
        let year = date.getFullYear();

        if (day < 10) {
            day = '0' + day;
        }

        if (month < 10) {
            month = '0' + month;
        }

        return year + '/' + month + '/' + day;
    };

    // Combine full name of a user
    const combineFullName = function (firstName, middleName, lastName) {
        if (!middleName || middleName.length === 0) {
            return firstName + ' ' + lastName;
        }
        return firstName + ' ' + middleName + ' ' + lastName;
    };


    /*
    ----------------------------------------------------------------
                QUERIES
    ----------------------------------------------------------------
 */
    const aggregateAppointmentsQuery =
    `SELECT type.type_code AS type, DAYOFYEAR(app.start_time) AS day, SUM(IF(appUser.no_show = 0, 1, 0)) AS attended, SUM(IF(appUser.no_show = 1, 1, 0)) AS missed
     FROM AppointmentUser appUser
     JOIN PatientRecord pr ON pr.patient_record_id = appUser.patient_record_id
     JOIN Appointment app ON appUser.appointment_id = app.appointment_id
     JOIN Type type ON app.type_id = type.type_id
     WHERE pr.patient_category_id = $1 AND pr.archived = 0 AND app.cancelled = 0 AND app.archived = 0
        AND pr.admission_date < NOW() AND (pr.discharge_date IS NULL OR pr.discharge_date >= app.end_time)
        AND NOT (app.end_time < $2 OR app.start_time > $3)
     GROUP BY type.type_code, DAYOFYEAR(app.start_time);`
;

    const aggregateIntensityQuery =
    `SELECT type.type_code AS type, TIMESTAMPDIFF(MINUTE, app.start_time, app.end_time) AS intensity
     FROM AppointmentUser appUser
     JOIN PatientRecord pr ON pr.patient_record_id = appUser.patient_record_id
     JOIN Appointment app ON appUser.appointment_id = app.appointment_id
     JOIN Type type ON app.type_id = type.type_id
     WHERE pr.patient_category_id = $1 AND pr.archived = 0 AND app.cancelled = 0 AND appUser.no_show = 0 AND app.archived = 0
        AND pr.admission_date < NOW() AND (pr.discharge_date IS NULL OR pr.discharge_date >= app.end_time)
        AND (NOT (app.end_time < $2 OR app.start_time > $3) OR ($2 IS NULL OR $3 IS NULL))
     GROUP BY app.appointment_id, type.type_code
     ORDER BY type.type_code, intensity ASC;`
;

    const aggregateLengthOfStayQuery =
    `SELECT IF(discharge_date IS NULL, GREATEST(0, DATEDIFF(NOW(), admission_date)), DATEDIFF(discharge_date, admission_date)) AS duration
     FROM PatientRecord
     WHERE patient_category_id = $1 AND archived = 0 AND admission_date < NOW()
          AND ($2 IS NULL OR admission_date <= $3)
          AND ($3 IS NULL OR discharge_date >= $2 OR discharge_date IS NULL)
     ORDER BY duration ASC`
;

    const aggregateDiagnosisQuery =
    `SELECT "stroke" AS diagnosis, COUNT(*) AS count
     FROM PatientRecord
     WHERE patient_category_id = $1 AND archived = 0 AND (diagnosis = "stroke") AND admission_date < NOW()
          AND ($2 IS NULL OR admission_date <= $3)
          AND ($3 IS NULL OR discharge_date >= $2 OR discharge_date IS NULL)
     UNION ALL
     SELECT "tbi" AS diagnosis, COUNT(*) AS count
     FROM PatientRecord
     WHERE patient_category_id = $1 AND archived = 0 AND (diagnosis = "tbi") AND admission_date < NOW()
          AND ($2 IS NULL OR admission_date <= $3)
          AND ($3 IS NULL OR discharge_date >= $2 OR discharge_date IS NULL)
     UNION ALL
     SELECT "other" AS diagnosis, COUNT(*) AS count
     FROM PatientRecord
     WHERE patient_category_id = $1 AND archived = 0 AND (diagnosis <> "stroke" AND diagnosis <> "tbi") AND admission_date < NOW()
          AND ($2 IS NULL OR admission_date <= $3)
          AND ($3 IS NULL OR discharge_date >= $2 OR discharge_date IS NULL);`
;

    const aggregatePatientCountQuery =
    `SELECT
        (SELECT COUNT(*) AS raw
         FROM PatientRecord
         WHERE patient_category_id = $1 AND archived = 0 AND admission_date < NOW()
			 AND ($2 IS NULL OR admission_date <= $3)
			 AND ($3 IS NULL OR discharge_date >= $2 OR discharge_date IS NULL)) AS raw,
        ((SELECT COUNT(*)
          FROM PatientRecord
          WHERE patient_category_id = $1 AND archived = 0 AND admission_date < NOW()
			 AND ($2 IS NULL OR admission_date <= $3)
			 AND ($3 IS NULL OR discharge_date >= $2 OR discharge_date IS NULL)) /
        (SELECT COUNT(*)
         FROM PatientRecord
         WHERE archived = 0 AND admission_date < NOW()
             AND ($2 IS NULL OR admission_date <= $3)
             AND ($3 IS NULL OR discharge_date >= $2 OR discharge_date IS NULL)
        )) * 100 AS percent;`
;

    const therapyQuery =
    `SELECT type.type_code AS code, SUM(TIMESTAMPDIFF(MINUTE, app.start_time, app.end_time)) AS total
     FROM AppointmentUser appUser
     JOIN Appointment app ON appUser.appointment_id = app.appointment_id
     JOIN Type type ON app.type_id = type.type_id
     WHERE appUser.user_id = $1 AND app.cancelled = 0 AND appUser.no_show = 0 AND app.archived = 0
         AND ($2 IS NULL OR app.start_time > $2)
         AND ($3 IS NULL OR app.end_time < $3)
         AND appUser.patient_record_id IN (
             SELECT patient_record_id
             FROM PatientRecord
             WHERE patient_id = $1 AND archived = 0
         )
     GROUP BY type.type_code
     ORDER BY type.type_code;`
;

    const intensityQuery =
    `SELECT record.patient_record_id AS record_id, type.type_code AS code, 
	 SUM(TIMESTAMPDIFF(MINUTE, app.start_time, app.end_time)) / 60.0 AS total
     FROM PatientRecord record
     JOIN AppointmentUser appUser ON record.patient_record_id = appUser.patient_record_id
     JOIN Appointment app ON appUser.appointment_id = app.appointment_id
     JOIN Type type ON app.type_id = type.type_id
     WHERE record.patient_id = $1 AND app.archived = 0 AND app.cancelled = 0 AND appUser.no_show = 0 AND record.archived = 0 AND record.admission_date < NOW()
     GROUP BY record.patient_record_id, type.type_code
     ORDER BY record.admission_date DESC;`
;

    const supportStaffQuery =
    `SELECT appUser.user_id AS id, therapist.code AS code, user.first_name AS fName, user.middle_name AS mName, user.last_name AS lName, type.type_code AS type
     FROM AppointmentUser appUser
     JOIN Appointment app ON appUser.appointment_id = app.appointment_id
     JOIN UserAccount user ON appUser.user_id = user.user_account_ID
     JOIN Type type ON app.type_id = type.type_id 
     JOIN Therapist therapist ON appUser.user_id = therapist.therapist_id
     WHERE user_id != $1 AND patient_record_id IS NULL
     AND app.archived = 0 AND app.cancelled = 0 AND appUser.no_show = 0 AND therapist.archived = 0
     AND appUser.appointment_id IN (
         SELECT appointment_id
         FROM AppointmentUser
         WHERE user_id = $1 AND no_show = 0
     )
     ORDER BY appUser.user_id ASC;`
;

    return router;
};
