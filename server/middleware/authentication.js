// const passport = require('passport');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JWTStrategy = require('passport-jwt').Strategy;
const path = require('path');
const env = process.env.NODE_ENV || 'development';
const config = require('../config.json')[env];
const models = require(path.join(__dirname, '/../models'));
const createError = require('http-errors');

module.exports = function(passport) {
    const opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.jwt_encryption
    };
    
    passport.use('jwt', new JWTStrategy(opts, (jwt_payload, done) => {
        try {
            models.UserAccount.findOne({
                where: {
                    email: jwt_payload.email,
                },
            }).then(user => {
                if (user) {
                    done(null, user);
                } else {
                    done(null, false);
                }
            });
        } catch (err) {
            done(createError(500, err));
        }
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    return {
        initialize: function() {
            return passport.initialize();
        },
        authenticate: function() {
            return passport.authenticate('jwt', {session: false});
        }
    };
};