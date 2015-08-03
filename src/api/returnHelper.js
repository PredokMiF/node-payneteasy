"use strict";

var _ = require('lodash-node');
var when = require('when');

var callMe = require(__modulesCustom + 'callMe');

var daoTransactionUpdate = require(__dao + 'transaction/transactionUpdate');
var daoTransactionStepCreate = require(__dao + 'transactionStep/transactionStepCreate');

var returnReq = require(__pne + 'returnReq');
var returnStatusReq = require(__pne + 'returnStatusReq');

var clientServerHelpers = require('./clientServerHelpers');

function doReq (data) {
    callMe.poll('doReturn', data.userUuid, [0,10,60,600,3600], data);
}

callMe.on('doReturn', function (data) {
    return returnReq(data)
        .then(
            function (response) {
                if (response.err) {
                    daoTransactionStepCreate.create('return', response.err.data['serial-number'], response.err.data['merchant-order-id'], response.err.data['paynet-order-id'], data, response.err.msg, response.err.data);
                } else {
                    clientServerHelpers.rejectTransaction(data);
                    data.returnPneId = response.data.returnPneId;
                    daoTransactionUpdate.update(data)
                        .then(function(){
                            daoTransactionStepCreate.create('return', response.data.data['serial-number'], response.data.data['merchant-order-id'], response.data.data['paynet-order-id'], data, null, response.data.data)
                        })
                        .then(function(){
                            callMe.poll('doReturnStatus', data.userUuid, [0,5,5,5,5,10,10,10,10,10,60,60,60,600,600,600,600,600,3600], data);
                        });
                }
            },
            function (err) {
                console.log('doReturn err');
                console.log(err);
                return when.reject(err);
            }
        );
});

callMe.on('doReturnStatus', function (data) {
    return returnStatusReq(data)
        .then(
            function (response) {
                if (response.err) {
                    daoTransactionStepCreate.create('returnStatus', response.err.data['serial-number'], response.err.data['merchant-order-id'], response.err.data['paynet-order-id'], data, response.err.msg, response.err.data);
                    return when.resolve();
                } else if (response) {
                    daoTransactionStepCreate.create('returnStatus', response.data.data['serial-number'], response.data.data['merchant-order-id'], response.data.data['paynet-order-id'], data, null, response.data.data);
                    return response.data.approved ? when.resolve() : when.reject()
                }
            },
            function (err) {
                console.log('doReturnStatus err');
                console.log(err);
                return when.reject(err);
            }
        );
});

module.exports = doReq;