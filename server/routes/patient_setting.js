// Endpoints only for admins
'use strict';

// const env = process.env.NODE_ENV;
const path = require('path');
const createError = require('http-errors');

const router = require('express').Router({mergeParams: true});
// const Op = require('sequelize').Op;
// const fs = require('fs');

const models = require(path.join(__dirname, '/../models'));

router.get('/settings', async (req, res, next) => {
    try {
        await models.PatientSetting.all().then(types => {
            res.status(200).send(JSON.stringify(types));
        });
    } catch (e) {
        return next(createError(e.status || 500, e.message || 'Internal Server Error'));
    }
});

// TODO: Code for updating a therapist-type
router.put('/:setting_id', async (req, res, next) => {
    const settingID = req.params.setting_id;
    const setting = req.body;

    if (!settingID) {
        return next(createError(400, 'Bad Request: Therapist ID is required.'));
    }

    try {
        models.PatientSetting.update(
            { 
                setting_type: setting.setting_type,
                archived: setting.archived
            },
            { where: 
                { patient_setting_ID: settingID }
            });
        res.status(200).send();
    } catch (e) {
        return next(createError(e.status || 500, e.message || 'Internal Server Error'));
    }
});

// TODO: May not need this
router.delete('/:setting_id', async (req, res, next) => {
    const settingID = req.params.setting_id;

    if (!settingID) {
        return next(createError(400, 'Bad Request: Setting ID is required.'));
    }

    try {
        await models.PatientSetting.destroy({
            where: {
                patient_setting_ID: settingID
            }
        });
        res.status(200).send();
    } catch (e) {
        return next(createError(e.status || 500, e.message || 'Internal Server Error'));
    }
});

// Create new Patient Setting
router.post('/patient_setting', async (req, res, next) => {
    const setting = req.body;

    try {
        await models.PatientSetting.create({
            setting_type: setting.setting_type,
            // Default to 0 on the frontend
            archived: setting.archived
        });
        res.status(200).send();
    } catch (e) {
        return next(createError(e.status || 500, e.message || 'Internal Server Error'));
    }
});

module.exports = router;