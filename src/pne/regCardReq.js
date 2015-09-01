"use strict";

var when = require('when');
var logger = require(__modulesCustom + 'logger')('regCardReq');

var CONFIG = require(__cfg);
var pneReq = require('./req');

/**
 * Привязывает карты по удачному запросу HOLDирования средств
 * @param data {Object}
 * @returns {Deferred} reject(err), resolve(data) data {err:{msg,code,data}} || {data:{pneReqSerialNumber,cardId,data}}
 */
function regCardReq(data) {
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
        orderid: data.preauthPneId
    };

    return when.promise(function(resolve, reject){
        pneReq({
            endpointid: endpointid,
            path: '/paynet/api/v2/create-card-ref/<endpointid>',
            data: data,
            controlFields: [['login'], ['client_orderid'], ['orderid'], ['control']]
        }, function (err, resData) {
            if (err) {
                logger.error('RegCard request error', {data: data, err: (err && err.stack || err)}, originalData.userUuid, originalData.transactionUuid);
                reject(err && err.stack || err);
            } else if (resData.type === 'validation-error' || resData.type === 'error') {
                logger.error('RegCard rejected', {data: data, errMsg: resData['error-message'], errCode: resData['error-code'], resData: resData}, originalData.userUuid, originalData.transactionUuid);
                resolve({err: {msg: resData['error-message'], code: resData['error-code'], data: resData}});
            } else if (resData.type === 'create-card-ref-response') {
                logger.info('RegCard resolved', {data: data, resData: resData}, originalData.userUuid, originalData.transactionUuid);
                resolve({
                    data: {
                        pneReqSerialNumber: resData['serial-number'],
                        cardId: resData['card-ref-id'],
                        data: resData
                    }
                });
            } else {
                logger.error('RegCard rejected with unknown error', {data: data, resData: resData}, originalData.userUuid, originalData.transactionUuid);
                reject({err: 'Error!', data: resData});
            }
        });
    });
}

module.exports = regCardReq;