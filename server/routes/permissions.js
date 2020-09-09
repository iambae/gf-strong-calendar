'use strict';

const path = require('path');
const createError = require('http-errors');

const router = require('express').Router({mergeParams: true});

const models = require(path.join(__dirname, '/../models'));

router.get('/:user_id', async (req, res, next) => {
    const userID = req.params.user_id;

    if (!userID) {
        return next(createError(400, 'Bad Request: User ID is required.'));
    }

    // TODO: Actually handle different kind of errors (i.e. not every error should result in 500)
    try {
        models.UserAccount.findOne({
            where: { user_account_ID: userID }
        }).then(user => {
            models.UserRolePermission.findAll({
                where: { user_role_id: user.user_role_id }
            }).then(rolePermissions => {
                models.Permission.findAll({
                    where: { permission_id: rolePermissions.map((rolePermission) => rolePermission.permission_id) }
                }).then(permissions => {
                    res.status(200).json(permissions.map((permission) => permission.permission_key));
                });
            });
        });
    } catch (e) {
        return next(createError(e.status || 500, e.message || 'Internal Server Error'));
    }
});

module.exports = router;