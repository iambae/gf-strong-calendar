'use strict';

const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize) => {
    const Patient = sequelize.define('Patient', {
        patient_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        patient_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        archived: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: 'Patient',
        timestamps: null
    });

    Patient.associate = (models) => {
        Patient.belongsTo(models.UserAccount, {foreignKey: 'patient_id'});
        Patient.hasMany(models.PatientRecord, {foreignKey: 'patient_id', targetKey: 'patient_id'});
    };
    return Patient;
};