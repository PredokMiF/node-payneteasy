"use strict";

var when = require('when');
var logger = require(__modulesCustom + 'logger')('makeRebillPreauthReq');

var CONFIG = require(__cfg);

var pneReq = require('./req');

/**
 * HOLDирует средства на карте плательщика по привязанной карте
 * Если в ответе resolve({data: {...}}), то сохранить pneId в общих данных, вернуть url
 * @param data {Object}
 * @param data.transactionUuid {String}
 * @returns {Deferred} reject(err), resolve(data) data {err:{msg,code,data}} || {data:{pneReqSerialNumber,transactionUuid,preauthPneId,data}}
 */
function makeRebillPreauthReq(data) {
    // id терминала PNE
    var originalData = data;
    var endpointid = data.endpointid;
    var endpoint = CONFIG && CONFIG.PAYNETEASY && CONFIG.PAYNETEASY.ENDPOINTS && CONFIG.PAYNETEASY.ENDPOINTS[endpointid] || {};

    data = {

    // Перевод

        login: endpoint.login,
        // Transaction UUID (Пользовательский идентификатор заказа.) (128/String)
        client_orderid: data.transactionUuid,
        // Сумма перевода. Копейки от рублей отделяются точкой. Например 10.5 (10/Numeric)
        amount: data.amount + data.comission,
        // This parameter may comprise multiple amounts, separated with ,. PaynetEasy will cycle through the amounts of the list, try to make a payment on that amount, until there are no more amounts from the list, or not get approved.
        //enumerate_amounts // ХЗ чё это
        // НДС (сумма) (10/Numeric)
        'cvv2': data.cvv2,
        // Трехзначный код валюты платежа, например RUB (3/String)
        currency: data.currency,
        // Назначение платежа (125/String)
        order_desc: data.orderDesc,
        // A short сomment
        comment: data.makeRebillComment,

    // Плательщик

        // Card reference id obtained at Card Registration step
        cardrefid: data.payer_cardId,
        // IP адрес плательщика (20/String)
        ipaddress: data.payer_ipaddress,

    // Остальное

        // URL the cardholder will be redirected to upon completion of the transaction. Please note that the cardholder will be redirected in any case, no matter whether the transaction is approved or declined. (128/String)
        redirect_url: data.redirectUrl,
        // URL the transaction result will be sent to. Merchant may use this URL for custom processing of the transaction completion, e.g. to collect sales data in Merchant’s database. See more details at Merchant Callbacks (128/String)
        server_callback_url: data.serverCallbackUrl
    };

    return when.promise(function(resolve, reject){
        pneReq({
            endpointid: endpointid,
            path: '/paynet/api/v2/make-rebill-preauth/<endpointid>',
            data: data,
            controlFields: [['login'], ['client_orderid'], ['cardrefid'], (data.amount*100).toFixed(0), ['currency'], ['control']]
        }, function (err, resData) {
            if (err) {
                logger.error('MakeRebillPreauth request error', {data: data, err: (err && err.stack || err)}, originalData.userUuid, originalData.transactionUuid);
                reject(err && err.stack || err);
            } else if (resData.type === 'validation-error' || resData.type === 'error') {
                logger.error('MakeRebillPreauth rejected', {data: data, errMsg: resData['error-message'], errCode: resData['error-code'], resData: resData}, originalData.userUuid, originalData.transactionUuid);
                resolve({err: {msg: resData['error-message'], code: resData['error-code'], data: resData}});
            } else if (resData.type === 'async-response') {
                logger.info('MakeRebillPreauth resolved', {data: data, resData: resData}, originalData.userUuid, originalData.transactionUuid);
                resolve({
                    data: {
                        pneReqSerialNumber: resData['serial-number'],
                        transactionUuid: resData['merchant-order-id'],
                        preauthPneId: resData['paynet-order-id'],
                        data: resData
                    }
                });
            } else {
                logger.error('MakeRebillPreauth rejected with unknown error', {data: data, resData: resData}, originalData.userUuid, originalData.transactionUuid);
                reject({err: 'Error!', data: resData});
            }
        });
    });
}

module.exports = makeRebillPreauthReq;