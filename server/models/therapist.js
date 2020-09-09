'use strict';

const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize) => {
    const Therapist = sequelize.define('Therapist', {
        therapist_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        archived: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: 'Therapist',
        timestamps: false
    });

    Therapist.associate = (models) => {
        Therapist.hasMany(models.TherapistType, {foreignKey: 'therapist_id', targetKey: 'therapist_id'});
        Therapist.hasMany(models.PatientSupport, {foreignKey: 'therapist_id', targetKey: 'therapist_id'});
        Therapist.belongsTo(models.UserAccount, {foreignKey: 'therapist_id'});
    };
    return Therapist;
};