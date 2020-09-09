'use strict';

const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize) => {
    const Permission = sequelize.define('Permission', {
        permission_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        permission_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        permission_key: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'Permission',
        timestamps: false
    });

    Permission.associate = (models) => {
        Permission.hasMany(models.UserRolePermission, {foreignKey: 'permission_id', targetKey: 'permission_id' });
    };
    return Permission;
};