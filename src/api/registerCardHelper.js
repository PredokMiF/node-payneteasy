"use strict";

var _ = require('lodash-node');
var when = require('when');
var logger = require(__modulesCustom + 'logger')('registerCardHelper');

var callMe = require(__modulesCustom + 'callMe');

var daoTransactionUpdate = require(__dao + 'transaction/transactionUpdate');
var daoTransactionStepCreate = require(__dao + 'transactionStep/transactionStepCreate');

var wireHelper = require('./wireHelper');

var regCardReq = require(__pne + 'regCardReq');

var clientServerHelpers = require('./clientServerHelpers');

function doReq (data) {
    if (data.registerCard) {
        callMe.poll('doRegCard', data.userUuid, [0,10,60,600,3600], data);
    } else {
        wireHelper(data);
    }
}

callMe.on('doRegCard', function (data) {
    return regCardReq(data)
        .then(
            function (response) {
                if (response.err) {
                    // Ошибка получения ID карты, не критично - продолжаем
                    daoTransactionStepCreate.create('regCard', response.err.data['serial-number'], data.transactionUuid, data.preauthPneId, data, response.err.msg, response.err.data);
                    wireHelper(data);
                } else {
                    // Все ок, высылаем серверу приложений id и идем дальше
                    data.cardId = response.data.cardId;
                    daoTransactionUpdate.update(data)
                        .then(function(){
                            daoTransactionStepCreate.create('regCard', response.data.data['serial-number'], data.transactionUuid, data.preauthPneId, data, null, response.data.data)
                        })
                        .then(function(){
                            clientServerHelpers.cardRegistred(data);
                            wireHelper(data);
                        });
                }
            }
        );
});

module.exports = doReq;