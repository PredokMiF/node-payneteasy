"use strict";

var _ = require('lodash-node');
var when = require('when');
//var logger = require(__modulesCustom + 'logger')('wireHelper');

var callMe = require(__modulesCustom + 'callMe');

var daoTransactionUpdate = require(__dao + 'transaction/transactionUpdate');
var daoTransactionStepCreate = require(__dao + 'transactionStep/transactionStepCreate');

var captureHelper = require('./captureHelper');
var returnHelper = require('./returnHelper');

var wireTransferReq = require(__pne + 'wireTransferReq');
var wireTransferStatusReq = require(__pne + 'wireTransferStatusReq');

function doReq (data) {
    callMe.poll('doWireTransfer', data.userUuid, [0,10,60,600,3600], data);
}

callMe.on('doWireTransfer', function (data) {
    return wireTransferReq(data)
        .then(
            function (response) {
                if (response.err) {
                    daoTransactionStepCreate.create('wireTransfer', response.err.data['serial-number'], data.transactionUuid, response.err.data['paynet-order-id'], data, response.err.msg, response.err.data);
                    returnHelper(data);
                } else {
                    data.wireTransferPneId = response.data.wireTransferPneId;
                    daoTransactionUpdate.update(data)
                        .then(function(){
                            daoTransactionStepCreate.create('wireTransfer', response.data.data['serial-number'], data.transactionUuid, response.data.data['paynet-order-id'], data, null, response.data.data)
                        })
                        .then(function(){
                            callMe.poll('doWireTransferStatus', data.userUuid, [0,5,5,5,5,10,10,10,10,10,60,60,60,600,600,600,600,600,3600], data);
                        });
                }
            }
        );
});

callMe.on('doWireTransferStatus', function (data) {
    return wireTransferStatusReq(data)
        .then(
            function (response) {
                if (response.err) {
                    daoTransactionStepCreate.create('wireTransferStatus', response.err.data['serial-number'], response.err.data['merchant-order-id'], data.wireTransferPneId, data, response.err.msg, response.err.data);
                    returnHelper(data);
                    return when.resolve();
                } else if (response) {
                    daoTransactionStepCreate.create('wireTransferStatus', response.data.data['serial-number'], response.data.data['merchant-order-id'], data.wireTransferPneId, data, null, response.data.data);
                    if (response.data.approved) {
                        captureHelper(data);
                        return when.resolve();
                    } else {
                        return when.reject();
                    }
                }
            }
        );
});

module.exports = doReq;