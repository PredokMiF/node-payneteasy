"use strict";

var when = require('when');

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
        order_desc: data.order_desc,
        // A short сomment
        comment: data.makeRebillComment,

    // Плательщик

        // Card reference id obtained at Card Registration step
        cardrefid: data.cardRefId,
        // IP адрес плательщика (20/String)
        ipaddress: data.payer_ipaddress,

    // Остальное

        // URL the transaction result will be sent to. Merchant may use this URL for custom processing of the transaction completion, e.g. to collect sales data in Merchant’s database. See more details at Merchant Callbacks (128/String)
        server_callback_url: data.server_callback_url
    };

    return when.promise(function(resolve, reject){
        pneReq({
            endpointid: endpointid,
            path: '/paynet/api/v2/make-rebill-preauth/<endpointid>',
            data: data,
            controlFields: [['login'], ['client_orderid'], ['cardrefid'], (data.amount*100).toFixed(0), ['currency'], ['control']]
        }, function (err, data) {
            if (err) {
                reject(err && err.stack || err);
            } else if (data.type === 'validation-error' || data.type === 'error') {
                resolve({err: {msg: data['error-message'], code: data['error-code'], data: JSON.stringify(data)}});
            } else if (data.type === 'async-response') {
                resolve({
                    data: {
                        pneReqSerialNumber: data['serial-number'],
                        transactionUuid: data['merchant-order-id'],
                        preauthPneId: data['paynet-order-id'],
                        data: JSON.stringify(data)
                    }
                });
            } else {
                reject({err: 'Error!', data: JSON.stringify(data)});
            }
        });
    });
}

module.exports = makeRebillPreauthReq;