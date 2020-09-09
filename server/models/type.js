'use strict';

const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize) => {
    const Type = sequelize.define('Type', {
        type_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        type_code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false
        },
        archived: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: 'Type',
        timestamps: false
    });

    Type.associate = (models) => {
        Type.hasMany(models.TherapistType, {foreignKey: 'type_id', targetKey: 'type_id'});
        Type.hasMany(models.Appointment, {foreignKey: 'type_id', targetKey: 'type_id'});
    };
    return Type;
};