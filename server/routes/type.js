// Endpoints only for admins
'use strict';

// const env = process.env.NODE_ENV;
const path = require('path');
const createError = require('http-errors');

const router = require('express').Router({ mergeParams: true });

const models = require(path.join(__dirname, '/../models'));

module.exports = function (authenticate) {
    router.get('/', authenticate, async (req, res, next) => {
        try {
            models.Type.all().then(async types => {
                const values = await formatTypesToOptions(types);
                res.status(200).send(JSON.stringify(values));
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });

    router.get('/table', authenticate, async (req, res, next) => {
        try {
            models.Type.all().then(async types => {
                const values = await formatTypeTableOptions(types);
                res.status(200).send(JSON.stringify(values));
            }).catch(err => {
                res.status(400).send(err);
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });

    router.put('/archive/:type_id', async (req, res, next) => {
        const typeID = req.params.type_id;

        if (!typeID) {
            return next(createError(400, 'Bad Request: Type ID is required.'));
        }

        try {
            models.Type.update(
                {
                    archived: true
                },
                {
                    where:{ type_id: typeID }
                }).then(obj => {
                res.status(200).send(obj);
            }).catch(err => {
                res.status(400).send(err);
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });

    router.put('/:type_id', async (req, res, next) => {
        const typeID = req.params.type_id;
        const typeInfo = req.body;

        if (!typeID) {
            return next(createError(400, 'Bad Request: Therapist ID is required.'));
        }

        try {
            models.Type.update(
                {
                    type_code: typeInfo.type_code,
                    description: typeInfo.description,
                    category: typeInfo.category,
                    color: typeInfo.color,
                    archived: typeInfo.archived
                },
                {
                    where:
                        { type_id: typeID }
                }).then(obj => {
                res.status(200).send(obj);
            }).catch(err => {
                res.status(400).send(err);
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });

    // TODO: May not need this
    router.delete('/:type_id', async (req, res, next) => {
        const typeID = req.params.type_id;

        if (!typeID) {
            return next(createError(400, 'Bad Request: Therapist ID is required.'));
        }

        try {
            await models.Type.destroy({
                where: {
                    type_id: typeID
                }
            });
            res.status(200).send();
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });

    // Create new Type
    router.post('/type', async (req, res, next) => {
        const type = req.body;

        try {
            models.Type.create({
                type_code: type.type_code,
                category: type.category,
                description: type.description,
                color: type.color,
                archived: type.archived
            }).then(created => {
                res.status(200).send(created);
            }).catch(err => {
                res.status(400).send(err);
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });

    const formatTypesToOptions = async function (typeArray) {
        let formatted = [];
        let option = {};
        typeArray.forEach(element => {
            option['key'] = element.type_id;
            option['label'] = element.type_code;
            option['value'] = element.type_code;

            formatted.push(option);
            option = {};
        });
        return formatted;
    };

    const formatTypeTableOptions = async function (types) {
        let formatted = [];
        let option = {};
        types.forEach(element => {
            option['typeId'] = element.type_id;
            option['typeCode'] = element.type_code;
            option['description'] = element.description;
            option['category'] = element.category;
            option['color'] = element.color;
            option['archived'] = element.archived;
            formatted.push(option);
            option = {};
        });
        return formatted;
    };
    return router;
};