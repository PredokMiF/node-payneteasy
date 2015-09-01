"use strict";

var when = require('when');
var logger = require(__modulesCustom + 'logger')('wireTransferStatusReq');

var CONFIG = require(__cfg);

var pneReq = require('./req');

/**
 * Проверяет статус перевода денег на счет получателя
 * @param data {Object}
 * @returns {Deferred} reject(err), resolve(data) data {err:{msg,status,code,data}} || {data:{pneReqSerialNumber,transactionUuid,wireTransferStatusPneId,status,processing,approved,data}}
 */
function wireTransferStatusReq(data) {
    // id терминала PNE
    var originalData = data;
    var endpointid = data.endpointid;
    var endpoint = CONFIG.PAYNETEASY.ENDPOINTS[endpointid] || {};

    data = {
        login: endpoint.login,
        client_orderid: data.transactionUuid,
        orderid: data.wireTransferPneId
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
                logger.error('WireTransferStatus request error', {data: data, err: (err && err.stack || err)}, originalData.userUuid, originalData.transactionUuid);
                reject(err && err.stack || err);
            } else if (resData.type === 'status-response') {
                if (resData.status === 'declined' || resData.status === 'error' || resData.status === 'filtered') {
                    logger.error('WireTransferStatus rejected', {data: data, errMsg: resData['error-message'], errCode: resData['error-code'], resData: resData}, originalData.userUuid, originalData.transactionUuid);
                    outData = {err: {msg: resData['error-message'],  status:  resData.status, code: resData['error-code'], data: resData}};
                } else {
                    outData = {
                        data: {
                            pneReqSerialNumber: resData['serial-number'],
                            transactionUuid: resData['merchant-order-id'],
                            wireTransferStatusPneId: resData['paynet-order-id'],
                            status: resData.status,
                            data: resData
                        }
                    };

                    if (resData.status === 'approved') {
                        logger.info('WireTransferStatus approved', {data: data, resData: resData}, originalData.userUuid, originalData.transactionUuid);
                        outData.data.approved = true;
                    } else {
                        logger.debug('WireTransferStatus processing', {data: data, resData: resData}, originalData.userUuid, originalData.transactionUuid);
                        outData.data.processing = true;
                    }
                }

                resolve(outData);
            } else {
                logger.error('WireTransferStatus rejected with unknown error', {data: data, resData: resData}, originalData.userUuid, originalData.transactionUuid);
                reject({err: 'Error!', data: resData});
            }
        });
    });
}

module.exports = wireTransferStatusReq;