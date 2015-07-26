"use strict";

var when = require('when');

var CONFIG = require(__cfg);
var pneReq = require('./req');

/**
 * Переводит заHOLDированные средства с карты плательщика
 * @param data {Object}
 * @returns {Deferred} reject(err), resolve(data) data {err:{msg,code,data}} || {data:{pneReqSerialNumber,transactionUuid,capturePneId,data}}
 */
function captureReq(data) {
    // id терминала PNE
    var endpointid = data.endpointid;
    var endpointCfg = CONFIG && CONFIG.PAYNETEASY && CONFIG.PAYNETEASY.ENDPOINTS && CONFIG.PAYNETEASY.ENDPOINTS[endpointid] || {};

    data = {

    // Перевод

        login: endpointCfg.login,

        // Transaction UUID (Пользовательский идентификатор заказа.) (128/String)
        client_orderid: data.transactionUuid,
        // ID операции HOLDирования средств
        orderid: data.preauthPneId,
        // Сумма перевода. Копейки от рублей отделяются точкой. Например 10.5 (10/Numeric)
        amount: data.amount + data.comission,
        // Трехзначный код валюты платежа, например RUB (3/String)
        currency: data.currency
    };

    return when.promise(function(resolve, reject){
        pneReq({
            endpointid: endpointid,
            path: '/paynet/api/v2/capture/<endpointid>',
            data: data,
            controlFields: [['login'], ['client_orderid'], ['orderid'], (data.amount*100).toFixed(0), data.currency, ['control']]
        }, function (err, data) {
            if (err) {
                reject(err && err.stack || err);
            } else if (data.type === 'validation-error' || data.type === 'error') {
                resolve({err: {msg: data['error-message'], code: data['error-code'], data: JSON.stringify(data)}});
            } else if (data.type === 'async-response') {
                resolve({
                    data: {
                        pneReqSerialNumber: data['serial-number'],
                        transactionUuid: data['merchant-order-id'],
                        capturePneId: data['paynet-order-id'],
                        data: JSON.stringify(data)
                    }
                });
            } else {
                reject({err: 'Error!', data: JSON.stringify(data)});
            }
        });
    });
}

module.exports = captureReq;