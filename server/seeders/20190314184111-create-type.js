'use strict';
const types = require('../data/types.json');
const therapist_types = require('../data/therapist_type.json');
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.bulkInsert(
            'Type',
            types,
            {}
        );

        await queryInterface.bulkInsert(
            'TherapistType',
            therapist_types,
            {}
        );
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('TherapistType', null, {});
        await queryInterface.bulkDelete('Type', null, {});
    }
};
