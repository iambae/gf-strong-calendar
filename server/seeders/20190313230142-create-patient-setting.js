'use strict';
const patientSettings = require('../data/patient_setting.json');
module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert(
            'PatientSetting',
            patientSettings,
            {}
        );
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('PatientSetting', null, {});
    }
};
