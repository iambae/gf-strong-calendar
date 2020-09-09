'use strict';

const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize) => {
    const TherapistType = sequelize.define('TherapistType', {
        therapist_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: 'therapist_type'
        },
        type_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: 'therapist_type'
        },
    }, {
        tableName: 'TherapistType',
        timestamps: false
    });

    TherapistType.associate = (models) => {
        TherapistType.belongsTo(models.UserAccount, {foreignKey: 'type_id'});
        TherapistType.belongsTo(models.Type, {foreignKey: 'type_id'});
    };
    return TherapistType;
};