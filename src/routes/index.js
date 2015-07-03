"use strict";

var when = require('when');
var _ = require('lodash-node');
var request = require('request');

var CONFIG = require(__cfg);

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
            result: 'dict val ok,cancel'
        }
    }, function (req, res, next) {
        return when.promise(function(resolve, reject){
            var db = CONFIG.dbGetSync();

            _.forEach(db.payments, function(el){
                var obj;
                if (el.transactionUuid === req.body.transactionUuid) {
                    obj = {
                        transactionUuid: el.transactionUuid,
                        userUuid: el.userUuid
                    };

                    if (req.body.result === 'ok') {
                        obj.state = el.state = 'done';
                    } else {
                        obj.state = el.state = 'error';
                        obj.errMsg = el.errMsg = 'Сообщение о какой то ошибке';
                        obj.errDesc = el.errDesc = 'Развернутое сообщение о какой то ошибке';
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

            res.render('index', { payments: _.filter(db.payments, 'state', 'new') });

            CONFIG.dbSetSync(db);

            resolve();
        });
    }));

};