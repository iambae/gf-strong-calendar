'use strict';

const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize) => {
    const AppointmentUser = sequelize.define('AppointmentUser', {
        appointment_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            unique: 'apppointment_user'
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            unique: 'apppointment_user'
        },
        patient_record_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }, 
        no_show: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }, 
        archived: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        }
    }, {
        tableName: 'AppointmentUser',
        timestamps: false
    });

    AppointmentUser.associate = (models) => {
        AppointmentUser.belongsTo(models.Appointment, {foreignKey: 'appointment_id'});
    };
    return AppointmentUser;
};