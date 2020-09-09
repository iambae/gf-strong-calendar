// Endpoints only for admins
'use strict';

// const env = process.env.NODE_ENV;
const path = require('path');
const createError = require('http-errors');

const router = require('express').Router({mergeParams: true});

const models = require(path.join(__dirname, '/../models'));

router.get('/categories', async (req, res, next) => {
    try {
        await models.PatientCategory.all().then(categories => {
            res.status(200).send(JSON.stringify(categories));
        });
    } catch (e) {
        return next(createError(e.status || 500, e.message || 'Internal Server Error'));
    }
});

router.put('/:category_id', async (req, res, next) => {
    const categoryID = req.params.category_id;
    const category = req.body;

    if (!categoryID) {
        return next(createError(400, 'Bad Request: Therapist ID is required.'));
    }

    try {
        models.PatientCategory.update(
            {
                archived: category.archived
            },
            { where: 
                { category: categoryID }
            });
        res.status(200).send();
    } catch (e) {
        return next(createError(e.status || 500, e.message || 'Internal Server Error'));
    }
});

// TODO: May not need this
router.delete('/:category_id', async (req, res, next) => {
    const categoryID = req.params.category_id;

    if (!categoryID) {
        return next(createError(400, 'Bad Request: Setting ID is required.'));
    }

    try {
        await models.PatientCategory.destroy({
            where: {
                category: categoryID
            }
        });
        res.status(200).send();
    } catch (e) {
        return next(createError(e.status || 500, e.message || 'Internal Server Error'));
    }
});

// Create new Patient Setting
router.post('/patient_category', async (req, res, next) => {
    const categoryInfo = req.body;

    try {
        await models.PatientCategory.create({
            category: categoryInfo.category,
            // Default to 0 on the frontend
            archived: categoryInfo.archived
        });
        res.status(200).send();
    } catch (e) {
        return next(createError(e.status || 500, e.message || 'Internal Server Error'));
    }
});

module.exports = router;