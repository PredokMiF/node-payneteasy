"use strict";

var when = require('when');

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
        }, function (err, data) {
            if (err) {
                reject(err && err.stack || err);
            } else if (data.type === 'status-response') {
                if (data.status === 'declined' || data.status === 'error' || data.status === 'filtered') {
                    outData = {err: {msg: data['error-message'],  status:  data.status, code: data['error-code'], data: data}};
                } else {
                    outData = {
                        data: {
                            pneReqSerialNumber: data['serial-number'],
                            transactionUuid: data['merchant-order-id'],
                            returnStatusPneId: data['paynet-order-id'],
                            status: data.status,
                            data: data
                        }
                    };

                    if (data.status === 'approved') {
                        outData.data.approved = true;
                    } else {
                        outData.data.processing = true;
                    }
                }

                resolve(outData);
            } else {
                reject({err: 'Error!', data: data});
            }
        });
    });
}

module.exports = returnStatusReq;