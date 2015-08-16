"use strict";

var _ = require('lodash-node');
var when = require('when');
var logger = require(__modulesCustom + 'logger')('captureHelper');

var callMe = require(__modulesCustom + 'callMe');

var daoTransactionUpdate = require(__dao + 'transaction/transactionUpdate');
var daoTransactionStepCreate = require(__dao + 'transactionStep/transactionStepCreate');

var clientServerHelpers = require('./clientServerHelpers');

var returnHelper = require('./returnHelper');

var captureReq = require(__pne + 'captureReq');
var captureStatusReq = require(__pne + 'captureStatusReq');

function doReq (data) {
    callMe.poll('doCapture', data.userUuid, [0,10,60,600,3600], data);
}

callMe.on('doCapture', function (data) {
    return captureReq(data)
        .then(
            function (response) {
                if (response.err) {
                    daoTransactionStepCreate.create('capture', response.err.data['serial-number'], response.err.data['merchant-order-id'], response.err.data['paynet-order-id'], data, response.err.msg, response.err.data);
                    returnHelper(data);
                } else {
                    data.capturePneId = response.data.capturePneId;
                    daoTransactionUpdate.update(data)
                        .then(function(){
                            daoTransactionStepCreate.create('capture', response.data.data['serial-number'], response.data.data['merchant-order-id'], response.data.data['paynet-order-id'], data, null, response.data.data)
                        })
                        .then(function(){
                            callMe.poll('doCaptureStatus', data.userUuid, [0,5,5,5,5,10,10,10,10,10,60,60,60,600,600,600,600,600,3600], data);
                        });
                }
            }
        );
});

callMe.on('doCaptureStatus', function (data) {
    return captureStatusReq(data)
        .then(
            function (response) {
                if (response.err) {
                    daoTransactionStepCreate.create('captureStatus', response.err.data['serial-number'], response.err.data['merchant-order-id'], data.capturePneId, data, response.err.msg, response.err.data);
                    returnHelper(data);
                    return when.resolve();
                } else if (response) {
                    daoTransactionStepCreate.create('captureStatus', response.data.data['serial-number'], response.data.data['merchant-order-id'], data.capturePneId, data, null, response.data.data);
                    if (response.data.approved) {
                        clientServerHelpers.resolveTransaction(data);
                        return when.resolve();
                    } else {
                        return when.reject();
                    }
                }
            }
        );
});

module.exports = doReq;