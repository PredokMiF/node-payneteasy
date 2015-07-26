"use strict";

var when = require('when');

var callMe = require('callMe');
var preauthReq = require(__pne + 'preauthReq');
var daoTransaction = require(__dao + 'daoTransaction');
var daoTransactionReq = require(__dao + 'daoTransactionReq');

function doPay(data) {
    return daoTransaction
        .createTransaction(data)
        .then(function(){
            return preauthReq(data);
        })
        .then(function(res){
            data.preauthPneId = res.preauthPneId;

            return when.all([
                daoTransaction.update(data),
                daoTransactionReq.create('preauth', res),
                callMe.poll('preauthStatus', data.userUuid, [10,10,10,10,10,10,10,60,60,60,60,60,60,60,600,600,600,600,600,600,600,3600], data)
            ]).then(function(){
                return res.data.url;
            });
        })
        .then(
            null,
            function (err) {
                console.errro(err);
                return when.reject('Ошибка');
            }
        );
}

callMe.on('preauthStatus', /* ToDo */);