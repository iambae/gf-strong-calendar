'use strict';

const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize) => {
    const UserRole = sequelize.define('UserRole', {
        user_role_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_role_name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'UserRole',
        timestamps: false
    });

    UserRole.associate = (models) => {
        UserRole.hasMany(models.UserAccount, {foreignKey: 'user_role_id', targetKey: 'user_role_id' });
        UserRole.hasMany(models.UserRolePermission, {foreignKey: 'user_role_id', targetKey: 'user_role_id' });
    };
    return UserRole;
};