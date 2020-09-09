'use strict';
const permissions = require('../data/permissions.json');
const userRolePermissions = require('../data/user_role_permission.json');
const userRoles = require('../data/user_role.json');
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.bulkInsert(
            'Permission',
            permissions,
            {}
        );

        await queryInterface.bulkInsert(
            'UserRole',
            userRoles,
            {}
        );

        await queryInterface.bulkInsert(
            'UserRolePermission',
            userRolePermissions,
            {}
        );
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('UserRolePermission', null, {});
        await queryInterface.bulkDelete('UserRole', null, {});
        await queryInterface.bulkDelete('Permission', null, {});
    }
};
