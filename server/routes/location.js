// Endpoints only for admins
'use strict';

// const env = process.env.NODE_ENV;
const path = require('path');
const createError = require('http-errors');

const router = require('express').Router({mergeParams: true});
// const Op = require('sequelize').Op;
// const fs = require('fs');

const models = require(path.join(__dirname, '/../models'));

module.exports = function(authenticate) {
    router.get('/', authenticate, async (req, res, next) => {
        try {
            models.Location.all().then(locations => {
                formatLocationsToOptions(locations).then(options => {
                    res.status(200).send(JSON.stringify(options));
                }).catch(err => {
                    res.status(400).send(err);
                });
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });

    router.get('/table', authenticate, async (req, res, next) => {
        try {
            models.Location.all().then(async locations => {
                const values = await formatLocationTableOptions(locations);
                res.status(200).send(JSON.stringify(values));
            }).catch(err => {
                res.status(400).send(JSON.stringify(err));
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });
    
    // TODO: Code for updating a location
    router.put('/:location_id', authenticate, async (req, res, next) => {
        const locationID = req.params.location_id;
        const loc = req.body;
    
        if (!locationID) {
            return next(createError(400, 'Bad Request: Location ID is required.'));
        }
    
        try {
            models.Location.update(
                { 
                    location: loc.location,
                    address: loc.address,
                    archived: loc.archived
                },
                { where: 
                    { location_ID: locationID }
                }).then(locations => {
                res.status(200).send(locations);
            }).catch(err => {
                res.status(400).send(err);
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });

    router.put('/archive/:location_id', authenticate, async (req, res, next) => {
        const locationID = req.params.location_id;
    
        if (!locationID) {
            return next(createError(400, 'Bad Request: Therapist ID is required.'));
        }
    
        try {
            models.Location.update(
                { 
                    archived: true
                },
                { where: 
                    { location_ID: locationID }
                }).then(loc => {
                res.status(200).send(loc);
            }).catch(err => {
                res.status(400).send(err);
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });
    
    // TODO: May not need this
    // change to archive?
    router.delete('/:location_id', authenticate, async (req, res, next) => {
        const locationID = req.params.location_id;
    
        if (!locationID) {
            return next(createError(400, 'Bad Request: Therapist ID is required.'));
        }
    
        try {
            await models.Location.destroy({
                where: {
                    location_ID: locationID
                }
            });
            res.status(200).send();
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });
    
    // Create new Location
    router.post('/location', authenticate, async (req, res, next) => {
        const loc = req.body;
    
        try {
            models.Location.create({
                location: loc.location,
                address: loc.address
            }).then(loc => {
                res.status(200).send(loc);
            }).catch(err => {
                res.status(400).send(err);
            });
        } catch (e) {
            return next(createError(e.status || 500, e.message || 'Internal Server Error'));
        }
    });

    const formatLocationsToOptions = async function(locations) {
        let formatted = [];
        let option = {};
        locations.forEach(element => {
            option['key'] = element.location_id;
            option['label'] = element.location;
            option['value'] = element.location;
    
            formatted.push(option);
            option = {};
        });
        return formatted;
    };

    const formatLocationTableOptions = async function(locations) {
        let formatted = [];
        let option = {};
        locations.forEach(element => {
            option['locationId'] = element.location_id;
            option['location'] = element.location;
            option['address'] = element.address;
            option['archived'] = element.archived;
            formatted.push(option);
            option = {};
        });
        return formatted;
    };

    return router;  
};