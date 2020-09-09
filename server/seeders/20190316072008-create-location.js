'use strict';
const locations = require('../data/location.json');
// const therapist_types = require('../data/therapist_type.json');
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.bulkInsert(
            'Location',
            locations,
            {}
        );

        // await queryInterface.bulkInsert(
        //     'TherapistType',
        //     therapist_types,
        //     {}
        // );
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('Location', null, {});
        // await queryInterface.bulkDelete('Type', null, {});
    }
};
