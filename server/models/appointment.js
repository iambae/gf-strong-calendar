'use strict';

const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize) => {
    const Appointment = sequelize.define('Appointment', {
        appointment_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        location_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        type_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        notes: {
            type: DataTypes.STRING,
            allowNull: true
        },
        cancelled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }, 
        archived: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: 'Appointment',
    });

    Appointment.associate = (models) => {
        Appointment.hasMany(models.AppointmentUser, {foreignKey: 'appointment_id', targetKey: 'appointment_id'});
    };
    return Appointment;
};