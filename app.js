const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const pg = require('pg');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const app = express();

const pgPool = new pg.Pool({
    ssl: true
});

app.use(session({
    store: new pgSession({
        pool : pgPool,                // Connection pool
        tableName : 'session'   // Use another table-name than the default "session" one
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true,
        maxAge: 15 * 24 * 60 * 60 * 1000 // 15 days
    }
}));

const indexRouter = require('./routes/index');

const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');

const memberIndexRouter = require('./routes/user/index');
const membersIndexRouter = require('./routes/user/members');
const changePassRouter = require('./routes/user/changepassword');

const doorApiRouter = require('./routes/api/v1/door');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('trust proxy', 1); // trust first proxy

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/', indexRouter);

app.use('/user', memberIndexRouter);
app.use('/user/members', membersIndexRouter);
app.use('/user/changepassword', changePassRouter);

app.use('/login', loginRouter);
app.use('/register', registerRouter);

app.use('/api/v1/door', doorApiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
