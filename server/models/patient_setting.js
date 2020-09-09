'use strict';

const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize) => {
    const PatientSetting = sequelize.define('PatientSetting', {
        patient_setting_ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        setting_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        archived: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'PatientSetting',
        timestamps: false
    });

    PatientSetting.associate = (models) => {
        PatientSetting.hasMany(models.PatientRecord, {foreignKey: 'patient_setting_id' });
    };
    return PatientSetting;
};