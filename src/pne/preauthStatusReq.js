"use strict";

var when = require('when');
var logger = require(__modulesCustom + 'logger')('preauthStatusReq');

var CONFIG = require(__cfg);

var pneReq = require('./req');

/**
 * Проверяет статус HOLDирования средства на карте плательщика
 * Если в ответе resolve({data: {status: 'approved', ...}}), то сохранить cardType, cardBankName, cardLastFourDigits в общих данных
 * @param data {Object}
 * @returns {Deferred} reject(err), resolve(data) data {err:{msg,status,code,data}} || {data:{pneReqSerialNumber,transactionUuid,preauthStatusPneId,status,processing,approved,data,card{cardType,bankName,lastFourDigits}}}
 */
function preauthStatusReq(data) {
    // id терминала PNE
    var originalData = data;
    var endpointid = data.endpointid;
    var endpoint = CONFIG && CONFIG.PAYNETEASY && CONFIG.PAYNETEASY.ENDPOINTS && CONFIG.PAYNETEASY.ENDPOINTS[endpointid] || {};

    data = {
        login: endpoint.login,
        client_orderid: data.transactionUuid,
        orderid: data.preauthPneId
    };

    return when.promise(function(resolve, reject){
        var outData;
        pneReq({
            endpointid: endpointid,
            path: '/paynet/api/v2/status/<endpointid>',
            data: data,
            controlFields: [['login'], ['client_orderid'], ['orderid'], ['control']]
        }, function (err, resData) {
            if (err) {
                logger.error('PreauthStatus request error', {data: data, err: (err && err.stack || err)}, originalData.userUuid, originalData.transactionUuid);
                reject(err && err.stack || err);
            } else if (resData.type === 'status-response') {
                if (resData.status === 'declined' || resData.status === 'error' || resData.status === 'filtered') {
                    logger.error('PreauthStatus rejected', {data: data, errMsg: resData['error-message'], errCode: resData['error-code'], resData: resData}, originalData.userUuid, originalData.transactionUuid);
                    outData = {err: {msg: resData['error-message'],  status:  resData.status, code: resData['error-code'], data: resData}};
                } else {
                    outData = {
                        data: {
                            pneReqSerialNumber: resData['serial-number'],
                            transactionUuid: resData['merchant-order-id'],
                            preauthStatusPneId: resData['paynet-order-id'],
                            status: resData.status,
                            data: resData
                        }
                    };

                    if (resData.status === 'approved') {
                        logger.info('PreauthStatus approved', {data: data, resData: resData}, originalData.userUuid, originalData.transactionUuid);
                        outData.data.approved = true;
                        outData.data.card = {
                            cardType: resData['card-type'],
                            bankName: resData['bank-name'],
                            lastFourDigits: resData['last-four-digits']
                        }
                    } else {
                        logger.debug('PreauthStatus processing', {data: data, resData: resData}, originalData.userUuid, originalData.transactionUuid);
                        outData.data.processing = true;
                    }
                }

                resolve(outData);
            } else {
                logger.error('PreauthStatus rejected with unknown error', {data: data, resData: resData}, originalData.userUuid, originalData.transactionUuid);
                reject({err: 'Error!', data: resData});
            }
        });
    });
}

module.exports = preauthStatusReq;