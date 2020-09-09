'use strict';

const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize) => {
    const PatientRecord = sequelize.define('PatientRecord', {
        patient_record_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        admission_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        discharge_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        comments: {
            type: DataTypes.STRING,
            allowNull: true
        },
        diagnosis: {
            type: DataTypes.STRING,
            allowNull: false
        },
        program: {
            type: DataTypes.STRING,
            allowNull: false
        },
        interruption_days: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        archived: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        patient_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'PatientRecord',
        timestamps: false
    });

    PatientRecord.associate = (models) => {
        PatientRecord.hasMany(models.PatientSupport, {foreignKey: 'patient_record_id', targetKey: 'patient_record_id'});
    };
    return PatientRecord;
};