'use strict';

const env = process.env.NODE_ENV || 'development';
const path = require('path');
const createError = require('http-errors');
const models = require(path.join(__dirname, '/../models'));
const bcrypt = require('bcrypt');
const config = require(__dirname + '/../config.json')[env];
const jwt = require('jsonwebtoken');
const randtoken = require('rand-token');
const router = require('express').Router({ mergeParams: true });
const key = config.jwt_encryption;
const expiresIn = 30 * 60; // Token expires in 3 minutes as per spec
var refreshTokens = {};

router.post('/login', (req, res, next) => {
    models.UserAccount.findOne({ where: { email: req.body.email } }).then(user => {
        try {
            if (!user) {
                return next(createError(404, 'User not found'));
            }
            if (!verifyPassword(user, req.body.password)) {
                res.status(401).send(createError(404, 'User not found'));
            } else {
                models.UserRolePermission.findAll({
                    where: {
                        user_role_id: user.user_role_id
                    },
                    attributes: ['permission_id']
                }).then((permissions) => {
                    const permissionIds = permissions.map(permission => permission.permission_id);
                    models.Permission.findAll({
                        where: {
                            permission_id: permissionIds
                        },
                        attributes: ['permission_key']
                    }).then(permissionValues => {
                        const permissionKeys = permissionValues.map(value => value.permission_key);
                        var randomToken = randtoken.uid(256);
                        const accessToken = jwt.sign({ id: user.user_account_ID, email: user.email, permissions: permissionKeys }, key, { expiresIn: expiresIn });
                        refreshTokens[randomToken] = req.body.email;
                        res.status(200).send({ data: filterUserObject(user), accessToken: accessToken, expiresIn: expiresIn, refreshToken: randomToken, permission: permissionKeys });
                    });
                });
            }
        } catch (err) {
            next(createError(500, err || 'Internal Server Error'));
        }
    });
});

router.post('/token', function (req, res, next) {
    const username = req.body.email;
    const refreshToken = req.body.refreshToken;
    if ((refreshToken in refreshTokens) && (refreshTokens[refreshToken] == username)) {
        models.UserAccount.findOne({
            where: { email: req.body.email }
        }).then(user => {
            return models.UserRolePermission.findAll({
                where: {
                    user_role_id: user.user_role_id
                },
                attributes: ['permission_id']
            }).then((permissions) => {
                const permissionIds = permissions.map(permission => permission.permission_id);
                models.Permission.findAll({
                    where: {
                        permission_id: permissionIds
                    },
                    attributes: ['permission_key']
                }).then(permissionValues => {
                    const permissionKeys = permissionValues.map(value => value.permission_key);
                    var randomToken = randtoken.uid(256);
                    var accessToken = jwt.sign({ id: user.user_account_ID , email: user.email, permissions: permissionKeys}, key, { expiresIn: expiresIn });
                    refreshTokens[randomToken] = req.body.email;
                    res.json({ accessToken });
                });
            });
        });
    }
});

const verifyPassword = function (user, password) {
    return bcrypt.compareSync(password, user.password);
};

// TODO get permissions and pass that to the object
const filterUserObject = function (user) {
    return {
        user_id: user.user_account_ID,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        email: user.email,
        user_role_id: user.user_role_id,
    };
};

module.exports = router;