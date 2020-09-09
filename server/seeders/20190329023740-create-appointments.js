'use strict';
const appointments = require('../data/appointment.json');
const appointmentUsers = require('../data/appointment_user.json');
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.bulkInsert(
            'Appointment',
            appointments,
            {}
        );

        await queryInterface.bulkInsert(
            'AppointmentUser',
            appointmentUsers,
            {}
        );
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('AppointmentUser', null, {});
        await queryInterface.bulkDelete('Appointment', null, {});
    }
};
