"use strict";

var when = require('when');

var pneReq = require('./req');

function preauthReq(endpointid, data) {
    return when.promise(function(resolve, reject){
        pneReq({
            endpointid: endpointid,
            path: '/paynet/api/v2/preauth-form/<endpointid>',
            data: data,
            controlFields: [['endpointid'], ['client_orderid'], (data.amount*100).toFixed(0), ['email'], ['control']]
        }, function (err, data) {
            if (err) {
                reject(err);
            } else {
                if (data.type === 'validation-error' || data.type === 'error') {
                    resolve({err: {msg: data['error-message'], code: data['error-code']}});
                } else {
                    resolve(data);
                }
            }
        });
    });
}

module.exports = preauthReq;