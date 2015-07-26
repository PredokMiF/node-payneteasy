"use strict";

var when = require('when');

var pneReq = require('./req');

/**
 * HOLDирует средства на карте плательщика
 * Если в ответе resolve({data: {...}}), то сохранить pneId в общих данных, вернуть url
 * @param data {Object}
 * @param data.transactionUuid {String}
 * @returns {Deferred} reject(err), resolve(data) data {err:{msg,code,data}} || {data:{pneReqSerialNumber,transactionUuid,preauthPneId,url,data}}
 */
function preauthReq(data) {
    // id терминала PNE
    var endpointid = data.endpointid;

    data = {

    // Перевод

        // Transaction UUID (Пользовательский идентификатор заказа.) (128/String)
        client_orderid: data.transactionUuid,
        // Сумма перевода. Копейки от рублей отделяются точкой. Например 10.5 (10/Numeric)
        amount: data.amount + data.comission,
        // НДС (сумма) (10/Numeric)
        'vat-amount': +data.NDS,
        // Трехзначный код валюты платежа, например RUB (3/String)
        currency: data.currency,
        // Назначение платежа (125/String)
        order_desc: data.order_desc,

    // Плательщик

        // Customer’s first name (50/String)
        first_name: data.payer_first_name,
        // Customer’s last name (50/String)
        last_name: data.payer_last_name,
        // Customer’s date of birth, in the format YYYYMMDD. (6/Numeric)
        birthday: data.payer_birthday,
        // E-mail плательщика (128/String)
        email: data.payer_email,
        // Телефон плательщика (15/String)
        phone: data.payer_phone,
        // Полный телефон плательщика, вместе с кодом города (15/String)
        cell_phone: data.payer_cell_phone,
        // Last four digits of the customer’s social security number. (4/Numeric)
        ssn: data.payer_ssn,
        // Код страны плательщика (2/String)
        country: data.payer_country,
        // Customer’s state (two-letter US state code). Please see Appendix A for a list of valid US state codes. Not applicable outside the US. (2/String)
        state: data.payer_state,
        // Город плательщика (50/String)
        city: data.payer_city,
        // Почтовый индекс плательщика (10/String)
        zip_code: data.payer_zip_code,
        // (50/String)
        address1: data.payer_address1,
        // IP адрес плательщика (20/String)
        ipaddress: data.payer_ipaddress,

    // Остальное

        // URL the cardholder will be redirected to upon completion of the transaction. Please note that the cardholder will be redirected in any case, no matter whether the transaction is approved or declined. (128/String)
        redirect_url: data.redirect_url,
        // URL the original sale is made from. (128/String)
        site_url: data.site_url,
        // URL the transaction result will be sent to. Merchant may use this URL for custom processing of the transaction completion, e.g. to collect sales data in Merchant’s database. See more details at Merchant Callbacks (128/String)
        server_callback_url: data.server_callback_url
    };

    return when.promise(function(resolve, reject){
        pneReq({
            endpointid: endpointid,
            path: '/paynet/api/v2/preauth-form/<endpointid>',
            data: data,
            controlFields: [['endpointid'], ['client_orderid'], (data.amount*100).toFixed(0), ['email'], ['control']]
        }, function (err, data) {
            if (err) {
                reject(err && err.stack || err);
            } else if (data.type === 'validation-error' || data.type === 'error') {
                resolve({err: {msg: data['error-message'], code: data['error-code'], data: JSON.stringify(data)}});
            } else if (data.type === 'async-form-response') {
                resolve({
                    data: {
                        pneReqSerialNumber: data['serial-number'],
                        transactionUuid: data['merchant-order-id'],
                        preauthPneId: data['paynet-order-id'],
                        url: data['redirect-url'],
                        data: JSON.stringify(data)
                    }
                });
            } else {
                reject({err: 'Error!', data: JSON.stringify(data)});
            }
        });
    });
}

module.exports = preauthReq;