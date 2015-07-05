"use strict";

var when = require('when');
var _ = require('lodash-node');
var request = require('request');

var CONFIG = require(__cfg);

var HandledError = require(__modulesCustom + 'handledError');
var ApiSecurity = require(__modulesCustom + 'api-security');

module.exports = function (app) {

    app.get('/', ApiSecurity({
        APIVer: 'none',
        role: 'all',
        reqUrlValidate: {},
        reqQueryValidate: {},
        reqBodyValidate: {}
    }, function (req, res, next) {
        return when.promise(function(resolve, reject){
            var db = CONFIG.dbGetSync();
            res.render('index', { payments: _.filter(db.payments, 'state', 'new') });

            resolve();
        });
    }));

    app.post('/', ApiSecurity({
        APIVer: 'none',
        role: 'all',
        reqUrlValidate: {},
        reqQueryValidate: {},
        reqBodyValidate: {
            transactionUuid: 's reqKey min 1',
            result: 'dict reqKey val ok,cancel'
        }
    }, function (req, res, next) {
        return when.promise(function(resolve, reject){
            var db = CONFIG.dbGetSync(),
                reqOut;

            _.forEach(db.payments, function(el){
                var obj;
                if (el.transactionUuid === req.body.transactionUuid) {
                    obj = {
                        transactionUuid: el.transactionUuid,
                        userUuid: el.userUuid
                    };

                    if (req.body.result === 'ok') {
                        obj.state = el.state = 'done';
                        reqOut = {
                            state: 'ok',
                            url: 'http://mydaomain.ru/pay?id=qweqweqwe'
                        };
                    } else {
                        obj.state = el.state = 'error';
                        obj.errMsg = el.errMsg = 'Сообщение о какой то ошибке';
                        obj.errDesc = el.errDesc = 'Развернутое сообщение о какой то ошибке';
                        reqOut = {
                            state: 'error',
                            errMsg: 'Сообщение о какой то ошибке',
                            errCode: 'SOME_ERROR_CODE'
                        };
                    }

                    request.post({
                        method: 'POST',
                        uri: 'http://' +CONFIG.CLIENT_SERVER.DOMAIN + ':' + CONFIG.CLIENT_SERVER.DOMAIN + CONFIG.CLIENT_SERVER.PATH,
                        form: obj
                    },
                        function(err, httpResponse, body) {
                            console.log(err, httpResponse, body);
                        }
                    );
                }
            });

            //res.render('index', { payments: _.filter(db.payments, 'state', 'new') });

            CONFIG.dbSetSync(db);

            //if (reqOut) {
                resolve(reqOut);
            //} else {
            //    reject(new HandledError('', {ERROR_MSG_CODE: 'UNAUTHORIZED'}));
            //}
        })
            .then(function(data){
                res.send(data);
            });
    }));

};