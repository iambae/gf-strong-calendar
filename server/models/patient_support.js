'use strict';

const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize) => {
    const PatientSupport = sequelize.define('PatientSupport', {
        patient_record_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: 'patient_support'
        },
        therapist_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: 'patient_support'
        },
        role_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: 'patient_support'
        }
    }, {
        tableName: 'PatientSupport',
        timestamps: false
    });
    return PatientSupport;
};