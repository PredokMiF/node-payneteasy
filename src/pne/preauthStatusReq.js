"use strict";

var when = require('when');

var CONFIG = require(__cfg);

var pneReq = require('./req');

/**
 * Если в ответе resolve({data: {status: 'approved', ...}}), то сохранить cardType, cardBankName, cardLastFourDigits в общих данных
 * @param data {Object}
 * @returns {*}
 */
function preauthStatusReq(data) {
    // id терминала PNE
    var endpointid = data.endpointid;
    var endpoint = CONFIG.PAYNETEASY.ENDPOINTS[endpointid] || {};

    data = {
        login: endpoint.login,
        client_orderid: data.transactionUuid,
        orderid: data.pneId
    };

    return when.promise(function(resolve, reject){
        var outData;
        pneReq({
            endpointid: endpointid,
            path: '/paynet/api/v2/status/<endpointid>',
            data: data,
            controlFields: [['login'], ['client_orderid'], ['orderid'], ['control']]
        }, function (err, data) {
            console.log('data');
            console.log(data);
            if (err) {
                reject(err && err.stack || err);
            } else if (data.type === 'status-response') {
                outData = {
                    data: {
                        serialNumber: data['serial-number'],
                        transactionUuid: data['merchant-order-id'],
                        pneId: data['paynet-order-id'],
                        status: data.status
                    }
                };

                if (data.status === 'approved') {
                    outData.data.approved = true;
                    outData.cardType = data['card-type'];
                    outData.cardBankName = data['bank-name'];
                    outData.cardLastFourDigits = data['last-four-digits'];
                } else if (data.status === 'declined' || data.status === 'error' || data.status === 'filtered') {
                    outData = {err: {msg: data['error-message'],  status:  data.status, code: data['error-code']}};
                } else {
                    outData.data.processing = true;
                }

                resolve(outData);
            } else {
                reject({err: 'Error!', data: JSON.stringify(data)});
            }
        });
    });
}

module.exports = preauthStatusReq;