require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const env = process.env.NODE_ENV || 'development';
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JWTStrategy = require('passport-jwt').Strategy;
const config = require('./config.json')[env];
const models = require(path.join(__dirname, './models'));
const cors = require('cors');
const bodyParser = require('body-parser');
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({credentials: true, origin: true}));
app.use(express.static(path.join(__dirname, 'public')));

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
const authenticate = passport.authenticate('jwt', { session : false });
app.use(passport.initialize());

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users')(authenticate);
var adminRouter = require('./routes/admin')(authenticate);
var loginRouter = require('./routes/login');
var patientRouter = require('./routes/patient')(authenticate);
var therapistRouter = require('./routes/therapist')(authenticate);
var patientRecordRouter = require('./routes/patient_record')(authenticate);
var patientSettingRouter = require('./routes/patient_setting');
var patientCategoryRouter = require('./routes/patient_category');
var typeRouter = require('./routes/type')(authenticate);
var therapistTypeRouter = require('./routes/therapist_type');
var appointmentRouter = require('./routes/appointment')(authenticate);
var locationRouter = require('./routes/location')(authenticate);
var permissionsRouter = require('./routes/permissions');
var reportsRouter = require('./routes/reports')(authenticate);

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/', loginRouter);
app.use('/api/patients', patientRouter);
app.use('/api/records', patientRecordRouter);
app.use('/api/therapists', therapistRouter);
app.use('/api/patient_settings', patientSettingRouter);
app.use('/api/patient_categories', patientCategoryRouter);
app.use('/api/types', typeRouter);
app.use('/api/therapist_type', therapistTypeRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/locations', locationRouter);
app.use('/api/permissions', permissionsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/admins', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    return next(createError(404));
});

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS, DELETE, GET');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'responseType, Origin, X-Requested-With, Content-Type, Accept, Range, Authorization, _headers, _normalizedNames, Pragma');
    res.header('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Encoding, Content-Length, Content-Range');
    res.header('Access-Control-Allow-Credentials', true);
    next();
});
// error handler
app.use(function(err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

const db = require('./models/index');
const port = process.env.PORT || 3000;

db.sequelize.sync({ alter: true }).then(() => {
    app.listen(port);
});

module.exports = app;
