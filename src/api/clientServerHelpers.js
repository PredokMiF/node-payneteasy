"use strict";

var _ = require('lodash-node');
var when = require('when');
var request = require('request');
var logger = require(__modulesCustom + 'logger')('clientServerHelpers');

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
 * @param {Array[]} [reqData.poolTime] периодичность повторов
 * @param {Integer} reqData.poolTime[] таймаут повторной попытки отправки
 * @param {Object} reqData.data данные команды, которые нужно передать на клиентский сервер
 */
function doClientServerReq (reqData) {
    if (!_.isPlainObject(reqData) || !_.isString(reqData.event) || reqData.event.length === 0 || !_.isPlainObject(reqData.data)) {
        logger.error('doClientServerReq is invalid parameters', reqData);
        return;
    }

    reqData.data.event = reqData.event;
    if (clientServerReqEvents[reqData.event]) {
        callMe.poll(reqData.event, reqData.userUuid, reqData.poolTime || [1,2,5,20,60, 300, 600], reqData);
    } else {
        logger.error('No callback for "'+reqData.event+'"! Only: ' + Object.keys(clientServerReqEvents).join(', '))
    }
}
function doClientServerReqCb (reqData) {
    var method = 'POST';
    var url = 'http://' + CONFIG.CLIENT_SERVER.DOMAIN + ':' + CONFIG.CLIENT_SERVER.PORT + CONFIG.CLIENT_SERVER.PATH;
    var form = reqData.data;

    return when.promise(function(resolve, reject){
        request({
            method: method,
            url: url,
            headers: {
                'Content-Type': 'application/json'
            },
            json: true,
            form: form
        }, function (err, res, body) {
            if (err || res.statusCode !== 200 || !body || body.err) {
                logger.error('Request to server error', {method: method, url: url, form: form, res: res, resBody: body, err: (err || body && body.err || (res.statusCode+':'+res.statusMessage))}, reqData.data.userUuid, reqData.data.transactionUuid);
                reject(err || body && body.err || (res.statusCode+':'+res.statusMessage));
                return;
            }
            logger.debug('Request to server success', {method: method, url: url, form: form, res: res, resBody: body}, reqData.data.userUuid, reqData.data.transactionUuid);
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

function rejectTransaction (data, errMsg) {
    var reqData = {
        event: 'transaction reject',
        //poolTime: [0, 5, 5, 5, 5, 10, 10, 10, 10, 10, 10, 10, 20, 20, 20, 20, 20, 20, 30, 30, 30, 30, 30, 30, 60],
        userUuid: data.userUuid,
        data: {
            transactionUuid: data.transactionUuid,
            userUuid: data.userUuid
        }
    };

    if (errMsg) {
        reqData.data.errMsg = errMsg;
    }

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