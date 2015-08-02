"use strict";

var _ = require('lodash-node');
var when = require('when');
var request = require('request');

var CONFIG = require(__cfg);
var callMe = require(__modulesCustom + 'callMe');

var daoTransactionStepCreate = require(__dao + 'transactionStep/transactionStepCreate');

// События на которые вешаются обработчики. На вызоде объект вида {<evName>: true} для удобного поиска подписанных солбэков
var clientServerReqEvents = _.reduce(['transaction resolve', 'transaction reject', 'register card'], function(accum, reqEvent){
    callMe.on(reqEvent, doClientServerReqCb);
    accum[reqEvent] = true;
    return accum;
}, {});

/**
 *
 * @param {Object} reqData
 * @param {String} reqData.event имя команды на клиентском сервера
 * @param {Array[]} [reqData.poolTime] имя команды на клиентском сервера
 * @param {Integer} reqData.poolTime[] таймаут повторной попытки отправки
 * @param {Object} reqData.data данные команды, которые нужно передать на клиентский сервер
 */
function doClientServerReq (reqData) {
    if (!_.isPlainObject(reqData) || !_.isString(reqData.event) || reqData.event.length === 0 || !_.isPlainObject(reqData.data)) {
        console.error('doClientServerReq is invalid parameters');
        return;
    }

    reqData.data.event = reqData.event;
    if (clientServerReqEvents[reqData.event]) {
        callMe.poll(reqData.event, reqData.userUuid, reqData.poolTime || [1,2,5,20,60, 300, 600], reqData);
    } else {
        console.error('No callback for "'+reqData.event+'"!')
    }
}
function doClientServerReqCb (reqData) {
    return when.promise(function(resolve, reject){
        request({
            method: 'POST',
            url: 'http://' + CONFIG.CLIENT_SERVER.DOMAIN + ':' + CONFIG.CLIENT_SERVER.PORT + CONFIG.CLIENT_SERVER.PATH,
            headers: {
                'Content-Type': 'application/json'
            },
            json: true,
            form: reqData.data
        }, function (err, res, body) {
            if (err || res.statusCode !== 200 || !body || body.err) {
                console.error(err || body && body.err || (res.statusCode+':'+res.statusMessage), JSON.stringify(res), body);
                reject(err || body && body.err || (res.statusCode+':'+res.statusMessage));
                return;
            }
            resolve();
        });
    });
}

function resolveTransaction (data) {
    var reqData = {
        event: 'transaction resolve',
        //poolTime: [0, 5, 5, 5, 5, 10, 10, 10, 10, 10, 10, 10, 20, 20, 20, 20, 20, 20, 30, 30, 30, 30, 30, 30, 60],
        userUuid: data.userUuid,
        data: {
            transactionUuid: data.transactionUuid,
            userUuid: data.userUuid
        }
    };

    doClientServerReq(reqData);
}

function rejectTransaction (data) {
    var reqData = {
        event: 'transaction reject',
        //poolTime: [0, 5, 5, 5, 5, 10, 10, 10, 10, 10, 10, 10, 20, 20, 20, 20, 20, 20, 30, 30, 30, 30, 30, 30, 60],
        userUuid: data.userUuid,
        data: {
            transactionUuid: data.transactionUuid,
            userUuid: data.userUuid
        }
    };

    doClientServerReq(reqData);
}

function cardRegistred (data) {
    var reqData = {
        event: 'register card',
        userUuid: data.userUuid,
        data: {
            userUuid: data.userUuid,
            transactionUuid: data.transactionUuid,
            cardId: data.cardId,
            cardType: data.cardType,
            cardBankName: data.cardBankName,
            cardLastFourDigits: data.cardLastFourDigits
        }
    };

    doClientServerReq(reqData);
}

module.exports = {
    resolveTransaction: resolveTransaction,
    rejectTransaction: rejectTransaction,
    cardRegistred: cardRegistred
};