"use strict";

var when = require('when');
var logger = require(__modulesCustom + 'logger')('returnReq');

var CONFIG = require(__cfg);
var pneReq = require('./req');

/**
 * Отменяет непереведенный HOLD средств на карте
 * @param data {Object}
 * @returns {Deferred} reject(err), resolve(data) data {err:{msg,code,data}} || {data:{pneReqSerialNumber,transactionUuid,returnPneId,data}}
 */
function returnReq(data) {
    // id терминала PNE
    var originalData = data;
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
        currency: data.currency,
        // Комментарий отмеры транзакции
        comment: data.returnComment
    };

    return when.promise(function(resolve, reject){
        pneReq({
            endpointid: endpointid,
            path: '/paynet/api/v2/return/<endpointid>',
            data: data,
            controlFields: [['login'], ['client_orderid'], ['orderid'], (data.amount*100).toFixed(0), data.currency, ['control']]
        }, function (err, resData) {
            if (err) {
                logger.error('Return request error', {data: data, err: (err && err.stack || err)}, originalData.userUuid, originalData.transactionUuid);
                reject(err && err.stack || err);
            } else if (resData.type === 'validation-error' || resData.type === 'error') {
                logger.error('Return rejected', {data: data, errMsg: resData['error-message'], errCode: resData['error-code'], resData: resData}, originalData.userUuid, originalData.transactionUuid);
                resolve({err: {msg: resData['error-message'], code: resData['error-code'], data: resData}});
            } else if (resData.type === 'async-response') {
                logger.info('Return resolved', {data: data, resData: resData}, originalData.userUuid, originalData.transactionUuid);
                resolve({
                    data: {
                        pneReqSerialNumber: resData['serial-number'],
                        transactionUuid: resData['merchant-order-id'],
                        returnPneId: resData['paynet-order-id'],
                        data: resData
                    }
                });
            } else {
                logger.error('Return rejected with unknown error', {data: data, resData: resData}, originalData.userUuid, originalData.transactionUuid);
                reject({err: 'Error!', data: resData});
            }
        });
    });
}

module.exports = returnReq;