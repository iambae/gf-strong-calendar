'use strict';

const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize) => {
    const PatientCategory = sequelize.define('PatientCategory', {
        category: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        archived: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'PatientCategory',
        timestamps: null
    });

    PatientCategory.associate = (models) => {
        PatientCategory.hasMany(models.PatientRecord, {foreignKey: 'patient_category_id' });
    };
    return PatientCategory;
};