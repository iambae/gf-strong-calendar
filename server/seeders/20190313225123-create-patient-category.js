'use strict';
const patientCategories = require('../data/patient_category.json');
module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert(
            'PatientCategory',
            patientCategories,
            {}
        );
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('PatientCategory', null, {});
    }
};
