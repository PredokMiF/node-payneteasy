"use strict";

var when = require('when');

var pneReq = require('./req');

/**
 * Перевод денег на счет получателя
 * @param data {Object}
 * @returns {Deferred} reject(err), resolve(data) data {err:{msg,code,data}} || {data:{pneReqSerialNumber,transactionUuid,wireTransferPneId,data}}
 */
function wireTransferReq(data) {
    // id терминала PNE
    var endpointid = data.endpointid;

    data = {

    // Перевод

        // Transaction UUID (Пользовательский идентификатор заказа.) (128/String)
        client_orderid: data.transactionUuid,
        // Сумма перевода. Копейки от рублей отделяются точкой. Например 10.5 (10/Numeric)
        amount: data.amount,
        // НДС (сумма) (10/Numeric)
        'vat-amount': +data.NDS,
        // Трехзначный код валюты платежа, например RUB (3/String)
        currency: data.currency,
        // Назначение платежа (125/String)
        'payment-details': data.orderDesc,

    // Плательщик

        // Получатель платежа (128/String)
        'payer-fullname': data.payer_fullname,
        // Тип, серия и номер документа, удостоверяющего личность. Укажите нужный тип документа (2 цифры) + запятая + символы от 4 до 64 (64/String)
        'payer-identity-document': data.payer_identityDocument,
        // E-mail плательщика (128/String)
        'payer-email': data.payer_email,
        // Телефон плательщика (15/String)
        'payer-phone': data.payer_phone,

    // Получатель

        // Получатель платежа (255/String)
        'recipient-name': data.recipient_name,
        // ИНН получателя (255/String)
        'recipient-inn': data.recipient_inn,
        // Номер счета получателя (20/Numeric)
        'recipient-account-number': data.recipient_accountNumber,
        // БИК банка получателя (9/Numeric)
        'recipient-bank-bic': data.recipient_bankBic,

    // Остальное

        // URL the transaction result will be sent to. Merchant may use this URL for custom processing of the transaction completion, e.g. to collect sales data in Merchant’s database. See more details at Merchant Callbacks (128/String)
        server_callback_url: data.serverCallbackUrl
    };

    return when.promise(function(resolve, reject){
        pneReq({
            endpointid: endpointid,
            path: '/paynet/api/v2/bank-wire-transfer/<endpointid>',
            data: data,
            controlFields: [['endpointid'], ['client_orderid'], ['payer-fullname'], ['recipient-name'], ['recipient-account-number'], ['recipient-bank-bic'], (data.amount*100).toFixed(0), (data['vat-amount']*100).toFixed(0), ['currency'], ['control']]
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
                        wireTransferPneId: data['paynet-order-id'],
                        data: JSON.stringify(data)
                    }
                });
            } else {
                reject({err: 'Error!', data: JSON.stringify(data)});
            }
        });
    });
}

module.exports = wireTransferReq;