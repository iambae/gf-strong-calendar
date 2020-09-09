'use strict';

const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize) => {
    const Location = sequelize.define('Location', {
        location_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        archived: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: 'Location',
        timestamps: false
    });

    Location.associate = (models) => {
        Location.hasMany(models.Appointment, {foreignKey: 'location_id', targetKey: 'location_id'});
    };
    return Location;
};