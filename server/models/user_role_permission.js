'use strict';

const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize) => {
    const UserRolePermission = sequelize.define('UserRolePermission', {
        user_role_permission_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        }
    }, {
        tableName: 'UserRolePermission',
        timestamps: false
    });

    UserRolePermission.associate = (models) => {
        UserRolePermission.belongsTo(models.Permission, {foreignKey: 'user_role_id' });
        UserRolePermission.belongsTo(models.UserRole, {foreignKey: 'user_role_id' });
    };
    return UserRolePermission;
};