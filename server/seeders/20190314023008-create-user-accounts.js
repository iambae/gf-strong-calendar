'use strict';
const users = require('../data/users.json');
const patients = require('../data/patients.json');
const therapists = require('../data/therapists.json');
const patient_records = require('../data/patient_record.json');
const admins = require('../data/admin.json');
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.bulkInsert(
            'UserAccount',
            users,
            {}
        );

        await queryInterface.bulkInsert(
            'Patient',
            patients,
            {}
        );

        await queryInterface.bulkInsert(
            'Therapist',
            therapists,
            {}
        );

        await queryInterface.bulkInsert(
            'PatientRecord',
            patient_records,
            {}
        );

        await queryInterface.bulkInsert(
            'AdminAccount',
            admins,
            {}
        );
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('AdminAccount', null, {});
        await queryInterface.bulkDelete('PatientRecord', null, {});
        await queryInterface.bulkDelete('Therapist', null, {});
        await queryInterface.bulkDelete('Patient', null, {});
        await queryInterface.bulkDelete('UserAccount', null, {});
    }
};
