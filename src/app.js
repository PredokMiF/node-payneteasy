var path = require('path');
var util = require('util');

var logger = require(__modulesCustom + 'logger')('app');

var express = require('express');
var bodyParser = require('body-parser');

var cfg = require(__cfg);
var HandledError = require(__modulesCustom + 'handledError');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/apidoc', express.static(path.join(__dirname, '../', 'apidoc')));

app.use(function(req, res, next){
    var end;
    req._startTime = new Date;
    end = res.end;
    res.end = function(chunk, encoding) {
        var message;
        res.end = end;
        res.end(chunk, encoding);

        if (res.statusCode === 200) {
            logger.debug('http logger', {method: req.method, path: req.path, status: res.statusCode, execTime: (new Date - req._startTime)});
        } else {
            logger.error('http logger', {method: req.method, path: req.path, status: res.statusCode, execTime: (new Date - req._startTime)});
        }
    };
    return next();
});

app.get('/*', function(req, res, next){
    res.setHeader('Last-Modified', (new Date()).toUTCString());
    next();
});

require('./api/all')(app);

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
    var status, outErrObj, logErrObj;

    if (err instanceof HandledError) {
        status = err.status || 200;
        outErrObj = {
            err: {
                msg: err.message,
                extra: err.extra,
                stack: DEV && err.stack
            }
        };
        logErrObj = {
            err: {
                msg: err.message,
                extra: err.extra,
                stack: err.stack
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
        logErrObj = {
            err: {
                msg: err.message || err,
                stack: err.stack
            }
        }
    }

    res.status(status);
    res.send(outErrObj);
    logger.error(
        'response error',
        {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            session: req.session,
            urlParams: req.params,
            query: req.query,
            body: req.body,
            data: logErrObj
        }
    );
});


module.exports = app;
