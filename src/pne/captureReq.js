"use strict";

var when = require('when');
var logger = require(__modulesCustom + 'logger')('captureReq');

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
        }, function (err, resData) {
            if (err) {
                logger.error('Capture request error', {data: data, err: (err && err.stack || err)});
                reject(err && err.stack || err);
            } else if (resData.type === 'validation-error' || resData.type === 'error') {
                logger.error('Capture rejected', {data: data, errMsg: resData['error-message'], errCode: resData['error-code'], resData: resData});
                resolve({err: {msg: resData['error-message'], code: resData['error-code'], data: resData}});
            } else if (resData.type === 'async-response') {
                logger.info('Capture resolved', {data: data, resData: resData});
                resolve({
                    data: {
                        pneReqSerialNumber: resData['serial-number'],
                        transactionUuid: resData['merchant-order-id'],
                        capturePneId: resData['paynet-order-id'],
                        data: resData
                    }
                });
            } else {
                logger.error('Capture rejected with unknown error', {data: data, resData: resData});
                reject({err: 'Error!', data: resData});
            }
        });
    });
}

module.exports = captureReq;