"use strict";

var when = require('when');

var CONFIG = require(__cfg);

var pneReq = require('./req');

/**
 * Если в ответе resolve({data: {status: 'approved', ...}}), то сохранить cardType, cardBankName, cardLastFourDigits в общих данных
 * @param data {Object}
 * @returns {Deferred} reject(err), resolve(data) data {err:{msg,status,code,data}} || {data:{pneReqSerialNumber,transactionUuid,preauthStatusPneId,status,processing,approved,html,data,card{cardType,bankName,lastFourDigits}}}
 */
function makeRebillPreauthStatusReq(data) {
    // id терминала PNE
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
        }, function (err, data) {
            if (err) {
                reject(err && err.stack || err);
            } else if (data.type === 'status-response') {
                if (data.status === 'declined' || data.status === 'error' || data.status === 'filtered') {
                    outData = {err: {msg: data['error-message'],  status:  data.status, code: data['error-code'], data: JSON.stringify(data)}};
                } else {
                    outData = {
                        data: {
                            pneReqSerialNumber: data['serial-number'],
                            transactionUuid: data['merchant-order-id'],
                            preauthStatusPneId: data['paynet-order-id'],
                            status: data.status,
                            html: data.html,
                            data: JSON.stringify(data)
                        }
                    };

                    if (data.status === 'approved') {
                        outData.data.approved = true;
                        outData.data.card = {
                            'cardType': data['card-type'],
                            bankName: data['bank-name'],
                            lastFourDigits: data['last-four-digits']
                        }
                    } else {
                        outData.data.processing = true;
                    }
                }

                resolve(outData);
            } else {
                reject({err: 'Error!', data: JSON.stringify(data)});
            }
        });
    });
}

module.exports = makeRebillPreauthStatusReq;