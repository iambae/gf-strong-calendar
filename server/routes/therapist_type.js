'use strict';

// const env = process.env.NODE_ENV;
const path = require('path');
const createError = require('http-errors');
const router = require('express').Router({ mergeParams: true });

const models = require(path.join(__dirname, '/../models'));

router.get('/:therapist_id', async (req, res, next) => {
    const therapistID = req.params.therapist_id;

    if (!therapistID) {
        return next(createError(400, 'Bad Request: Therapist ID is required.'));
    }

    try {
        models.TherapistType.findAll({
            where: { therapist_id: therapistID }
        }).then(ttypes => {
            res.status(200).json(ttypes);
        });
    } catch (e) {
        return next(createError(e.status || 500, e.message || 'Internal Server Error'));
    }
});

// TODO: Code for updating therapist
router.put('/:therapist_id', async (req, res, next) => {
    const therapistID = req.params.therapist_id;
    const typeInfo = req.body;

    if (!therapistID) {
        return next(createError(400, 'Bad Request: Therapist ID is required.'));
    }
    const types = models.Type.findAll({
        where: {
            type_code: typeInfo.type_code
        }
    })
        .then(type => {
            return type;
        });
    // Remove all types for the therapist
    await models.TherapistType.destroy({
        where: {
            therapist_id: therapistID
        }
    });
    Promise.all([types])
        .then(responses => {
            updateArray(responses[0], therapistID).then(val => {
                models.TherapistType.bulkCreate(val).then(result => {
                    res.status(200).send(result);
                });
            });
        }).catch(err => {
            return next(createError(500, err || 'Internal Server Error'));
        });
});

// TODO: Code for deleting therapist type
router.delete('/:therapist_id', async (req, res, next) => {
    const therapistID = req.params.therapist_id;

    if (!therapistID) {
        return next(createError(400, 'Bad Request: Therapist ID is required.'));
    }

    try {
        await models.TherapistType.destroy({
            where: {
                therapist_id: therapistID
            }
        }).then(response => {
            res.status(200).send(response);
        }).catch(err => {
            res.status(400).send(err);
        });
    } catch (e) {
        return next(createError(e.status || 500, e.message || 'Internal Server Error'));
    }
});

router.post('/therapist_type', (req, res, next) => {
    const typeInfo = req.body;

    const types = models.Type.findAll({
        where: {
            type_code: typeInfo.type_code
        }
    })
        .then(type => {
            return type;
        }).catch(err => {
            res.status(400).send(err);
        });

    Promise.all([types])
        .then(responses => {
            insertArray(responses[0], typeInfo).then(val => {
                models.TherapistType.bulkCreate(val).then(result => {
                    res.status(200).send(result);
                }).catch(err => {
                    res.status(400).send(err);
                });
            });
        }).catch(err => {
            return next(createError(500, err || 'Internal Server Error'));
        });
});

const insertArray = async function (responses, typeInfo) {
    var ret = [];
    var i = 0;
    responses.forEach(codeObject => {
        ret[i] = {
            therapist_id: typeInfo.therapist_id,
            type_id: codeObject.type_id
        };
        i++;
    });
    return ret;
};

const updateArray = async function (responses, id) {
    var ret = [];
    var i = 0;
    responses.forEach(codeObject => {
        ret[i] = {
            therapist_id: id,
            type_id: codeObject.type_id
        };
        i++;
    });
    return ret;
};
module.exports = router;