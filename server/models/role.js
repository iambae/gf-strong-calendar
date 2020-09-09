'use strict';

const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize) => {
    const Role = sequelize.define('Role', {
        role_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        tableName: 'Role',
        timestamps: false
    });

    Role.associate = (models) => {
        Role.hasMany(models.PatientSupport, {foreignKey: 'role_id', targetKey: 'role_id'});
    };
    return Role;
};