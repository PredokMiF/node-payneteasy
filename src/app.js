var path = require('path');

var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var cfg = require(__cfg);
var HandledError = require(__modulesCustom + 'handledError');
var ApiSecurity = require(__modulesCustom + 'api-security');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/apidoc', express.static(path.join(__dirname, '../', 'apidoc')));
app.use(express.static(path.join(__dirname, '../', 'public')));
app.use(logger('dev'));

require('./api/all')(app);
require('./routes/all')(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err;
    if (req.__myAPIVerError) {
        err = new HandledError('Данная версия API не существуется или более не поддерживается', {ERROR_MSG_CODE: 'WRONG_API_VERSION'});
    } else {
        err = new HandledError(404, 'Not Found');
    }
    next(err);
});

// error handlers

// development error handler
// will print stacktrace

var DEV = app.get('env') === 'development';

// Отлавливаем ошибку
app.use(function (err, req, res, next) {
    var status, outErrObj;

    if (err instanceof HandledError) {
        status = err.status || 200;
        outErrObj = {
            err: {
                msg: err.message,
                extra: err.extra,
                //extra: JSON.stringify(err.extra, null, 4),
                stack: DEV && err.stack
            }
        };
    } else {
        status = err.status || 500;
        outErrObj = {
            err: {
                msg: (DEV ? (err.message || err) : 'Internal Server Error'),
                stack: DEV && err.stack
            }
        };
    }

    next({status: status, errObj: outErrObj});
});

// Рендерим ошибку
app.use(function (err, req, res, next) {
    res.status(err.status);
    if (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1) {
        // Отвечаем JSON'ом
        res.send(err.errObj);
    } else {
        // Отвечаем HTML'ем
        err.errObj.status = err.status;
        err.errObj.err.extra = JSON.stringify(err.errObj.err.extra, null, 4);
        err.errObj.layout = false;
        res.render('error', err.errObj);
    }
});


module.exports = app;
