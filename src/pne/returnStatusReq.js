"use strict";

var when = require('when');
var logger = require(__modulesCustom + 'logger')('returnStatusReq');

var CONFIG = require(__cfg);

var pneReq = require('./req');

/**
 * Проверяет статус отмены HOLDа средств на карте
 * @param data {Object}
 * @returns {Deferred} reject(err), resolve(data) data {err:{msg,status,code,data}} || {data:{pneReqSerialNumber,transactionUuid,returnStatusPneId,status,processing,approved,data}}
 */
function returnStatusReq(data) {
    // id терминала PNE
    var endpointid = data.endpointid;
    var endpoint = CONFIG.PAYNETEASY.ENDPOINTS[endpointid] || {};

    data = {
        login: endpoint.login,
        client_orderid: data.transactionUuid,
        orderid: data.returnPneId
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
                logger.error('ReturnStatus request error', {data: data, err: (err && err.stack || err)});
                reject(err && err.stack || err);
            } else if (resData.type === 'status-response') {
                if (resData.status === 'declined' || resData.status === 'error' || resData.status === 'filtered') {
                    logger.error('ReturnStatus rejected', {data: data, errMsg: resData['error-message'], errCode: resData['error-code'], resData: resData});
                    outData = {err: {msg: resData['error-message'],  status:  resData.status, code: resData['error-code'], data: resData}};
                } else {
                    outData = {
                        data: {
                            pneReqSerialNumber: resData['serial-number'],
                            transactionUuid: resData['merchant-order-id'],
                            returnStatusPneId: resData['paynet-order-id'],
                            status: resData.status,
                            data: resData
                        }
                    };

                    if (resData.status === 'approved') {
                        logger.info('ReturnStatus approved', {data: data, resData: resData});
                        outData.data.approved = true;
                    } else {
                        logger.debug('ReturnStatus processing', {data: data, resData: resData});
                        outData.data.processing = true;
                    }
                }

                resolve(outData);
            } else {
                logger.error('ReturnStatus rejected with unknown error', {data: data, resData: resData});
                reject({err: 'Error!', data: resData});
            }
        });
    });
}

module.exports = returnStatusReq;