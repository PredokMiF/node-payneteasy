"use strict";

var _ = require('lodash-node');
var when = require('when');

var CONFIG = require(__cfg);
var logger = require(__modulesCustom + 'logger')('pay');
var callMe = require(__modulesCustom + 'callMe');

var ApiSecurity = require(__modulesCustom + 'api-security');
var HandledError = require(__modulesCustom + 'handledError');
var daoTransactionCreate = require(__dao + 'transaction/transactionCreate');
var daoTransactionUpdate = require(__dao + 'transaction/transactionUpdate');
var daoTransactionStepCreate = require(__dao + 'transactionStep/transactionStepCreate');

var preauthReq = require(__pne + 'preauthReq');
var preauthStatusReq = require(__pne + 'preauthStatusReq');
var registerCardHelper = require('./registerCardHelper');
var makeRebillPreauthReq = require(__pne + 'makeRebillPreauthReq');
var makeRebillPreauthStatusReq = require(__pne + 'makeRebillPreauthStatusReq');

var wireHelper = require('./wireHelper');
var clientServerHelpers = require('./clientServerHelpers');

var SEC = 1000;
var MINUTE = 60 * SEC;

module.exports = function (app) {

    // Чтоб вернуть успешный ответ (транзакция инициализировалась. Вернуть URL перехода) нужно выполнить несколько запросов, сохраняя Deferred функции
    // Тут лежат объекты вида {resolve, reject, res, created}
    var queue = {};
    // uuid'ы инициализирующихся транзакций
    var queueArray = [];

    // Чистим явно старые транзакции, если им больше 10 минут
    setInterval(function () {
        while (queueArray.length && queue[queueArray[0]].created > Date.now() + 10 * MINUTE) {
            queue[queueArray[0]].reject('10 mitute timeout/ request rejected');
            delete queue[queueArray[0]];
            queueArray.shift();
        }
    }, 10 * MINUTE);

    function cleanQueue (uuid) {
        var pos = queueArray.indexOf(uuid);
        if (pos !== -1) {
            queueArray.splice(pos, 1);
        }
        delete queue[uuid];
    }

    /**
     * @api {POST} /api/v<APIVer>/pay pay
     * @apiVersion 0.1.0
     * @apiDescription оплата по пластиковой карте (с вводом параметров карты и с привязаной картой)
     * @apiName Pay
     * @apiGroup Pay
     * @apiPermission user
     *
     * @apiParam {Integer} endpointid ID терминала оплаты
     * @apiParam {String} transactionUuid UUID транзакции оплаты
     * @apiParam {Number} amount целевая сумма перевода
     * @apiParam {Number} comission комиссия, добавляется к целевой сумме, образуя сумму платежа
     * @apiParam {Number} [NDS] НДС (Def: 0)
     * @apiParam {String} [currency] Валюта (Def: RUB)
     * @apiParam {String} orderDesc Назначение платежа
     * @apiParam {String} [makeRebillComment] Комментарий перевода по зарег. карте
     * @apiParam {String} [returnComment] Комментарий отмеры транзакции (Def: TRANSACTION_ERROR)
     *
     * @apiParam {String} userUuid UUID плательщика
     * @apiParam {String} [payer_firstName] Имя плательщика
     * @apiParam {String} [payer_lastName] Фамилия плательщика
     * @apiParam {String} payer_fullname Полное ФИО плательщика
     * @apiParam {String} payer_identityDocument Документ идентифицирующий плательщика. Формат "<ТИП_ДОКУМЕНТА>,<СЕРИЯ_НОМЕР_ДОКУМЕНТА>", где <ТИП_ДОКУМЕНТА> двузначное число от 01 до 11 (01-паспорт)
     * @apiParam {Number} [payer_ssn] Last four digits of the customer’s social security number
     * @apiParam {String} payer_email E-mail плательщика
     * @apiParam {String} [payer_phone] Телефон плательщика
     * @apiParam {String} [payer_cellPhone] Полный телефон плательщика, вместе с кодом города
     * @apiParam {String} [payer_country] од страны плательщика (Def: RU)
     * @apiParam {String} [payer_state] Customer’s state (two-letter US state code). Please see Appendix A for a list of valid US state codes. Not applicable outside the US
     * @apiParam {String} payer_city Город плательщика
     * @apiParam {String} payer_zipCode Почтовый индекс плательщика
     * @apiParam {String} [payer_address1] Адрес плательщика
     * @apiParam {String} payer_ipaddress IP адрес плательщика
     * @apiParam {String} [payer_cardId] ID привязаной карты плательщика
     * @apiParam {String} [payer_cardCvv2] CVV2 привязаной карты плательщика
     *
     * @apiParam {String} recipient_name Получатель платежа
     * @apiParam {String} recipient_inn ИНН получателя
     * @apiParam {String} recipient_accountNumber Номер счета получателя
     * @apiParam {String} recipient_bankBic БИК банка получателя
     *
     * @apiParam {String} redirectUrl URL куда осуществится переход клиента после оплаты
     * @apiParam {String} [siteUrl] URL the original sale is made from
     * @apiParam {String} [serverCallbackUrl] URL the transaction result will be sent to. Merchant may use this URL for custom processing of the transaction completion, e.g. to collect sales data in Merchant’s database. See more details at Merchant Callbacks (Пока не используется)
     *
     * @apiSuccessExample {json} Начался процесс проведенияплатежа:
     *      HTTP/1.1 200 OK
     *      { done: 'Ok!' }
     *
     * @apiUse RestErrorFormat_v0_2_0
     *
     * @apiSampleRequest /api/v0.1.0/pay
     */

    app.post('/api/v:APIVer/pay', ApiSecurity({
        APIVer: '0.1.0',
        role: 'all',
        reqUrlValidate: {},
        reqQueryValidate: {},
        reqBodyValidate: {

            // Перевод

            endpointid: 'n reqKey toNum isCeil min 1',
            transactionUuid: 's reqKey trim min 1',
            amount: 'n reqKey toNum toFixed 2 min 0.01',
            comission: 'n reqKey toNum toFixed 2 min 0.01',
            NDS: 'n def 0 toNum toFixed 2 min 0',
            currency: 's def RUB trim min 2',
            orderDesc: 's reqKey trim min 2',
            makeRebillComment: 's trim min 2',
            returnComment: 's def TRANSACTION_ERROR trim min 1',

            // Плательщик

            userUuid: 's reqKey trim min 1',
            payer_firstName: 's trim min 1',
            payer_lastName: 's trim min 1',
            payer_fullname: 's reqKey trim min 1',
            //payer_birthday: 'd', // нет валидатора
            payer_identityDocument: ['s reqKey trim min 7',
                function(val){
                    var parts = val.split(',');
                    // Д.б. две части <ТИП_ДОК>,<СЕРИЯ_И_НОМЕР_ДОКУМЕНТА>
                    if (parts.length < 2) {
                        return false;
                    }
                    // Проверка на возможные типы документов
                    if (['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'].indexOf(parts[0]) === -1) {
                        return false;
                    }
                    return true;
                }],
            payer_ssn: 'n min 1',
            payer_email: 's reqKey min 1 trim toLower',
            payer_phone: 's trim min 1',
            payer_cellPhone: 's trim min 1',
            payer_country: 's def RU trim min 2',
            payer_state: 's trim min 1',
            payer_city: 's reqKey trim min 1',
            payer_zipCode: 's reqKey trim min 1',
            payer_address1: 's trim min 1',
            payer_ipaddress: 's reqKey trim min 1',
            payer_cardId: 's null def null trim min 1',
            payer_cardCvv2: 's trim min 1',

            // Получатель

            recipient_name: 's reqKey trim min 1',
            recipient_inn: 's reqKey trim min 1',
            recipient_accountNumber: 's reqKey trim min 1',
            recipient_bankBic: 's reqKey trim min 1',

            // Остальное

            registerCard: 'b def false convert all',
            redirectUrl: 's reqKey trim min 2',
            siteUrl: 's trim min 2',
            serverCallbackUrl: 's trim min 2'
        }
    }, function (req, res, next) {
        logger.info('Lets try start transaction', req.body, req.body.userUuid, req.body.transactionUuid);
        return daoTransactionCreate.create(req.body)
            .then(function () {
                return when.promise(function(resolve, reject){

                    queue[req.body.transactionUuid] = {
                        resolve: resolve,
                        reject: reject,
                        res: res,
                        created: Date.now()
                    };
                    queueArray.push(req.body.transactionUuid);

                    if (!req.body.payer_cardId) {
                        // Оплата с вводом реквизитов карты
                        preauth(req.body);
                    } else {
                        // Оплата по привязанной банк. карте
                        makeRebillPreauth(req.body);
                    }
                });
            }, function (err) {
                logger.error('Start transaction filed', err, req.body.userUuid, req.body.transactionUuid);
            });
    }));

    function preauth (data) {
        var transactionUuid = data.transactionUuid;

        preauthReq(data).then(
            function(response){
                if (!response.err) {
                    // Ok!
                    response = response.data;
                    daoTransactionStepCreate.create('preauth', response.pneReqSerialNumber, transactionUuid, response.preauthPneId, data, null, response.data)
                        .then(function(){
                            data.preauthPneId = response.preauthPneId;
                            return daoTransactionUpdate.update(data);
                        })
                        .then(
                            function(){
                                queue[transactionUuid].res.send({
                                    transactionUuid: transactionUuid,
                                    url: response.url
                                });
                                queue[transactionUuid].resolve();
                                callMe.poll('preauthStatus', data.userUuid, [10,10,10,10,10,10,10,60,60,60,60,60,60,60,600,600,600,600,600,600,600,3600], data);
                            },
                            function (err) {
                                queue[transactionUuid].reject(err);
                            }
                        )
                        .finally(function(){
                            cleanQueue(transactionUuid);
                        });
                } else {
                    // Err
                    daoTransactionStepCreate.create('preauth', response.err.data['serial-number'], transactionUuid, null,data, response.err.msg, response.err.data)
                        .then(
                            function(){
                                queue[transactionUuid].reject(new HandledError(200, response.err.msg));
                            },
                            function (err) {
                                queue[transactionUuid].reject(err);
                            }
                        )
                        .finally(function(){
                            cleanQueue(transactionUuid);
                        });
                }
            },
            function(err){
                if (_.isPlainObject(err)) {
                    queue[transactionUuid].reject(new HandledError(200, err.err, err.data));
                } else {
                    queue[transactionUuid].reject(err);
                }
                cleanQueue(transactionUuid);
            }
        );
    }

    callMe.on('preauthStatus', function (data) {
        return preauthStatusReq(data)
            .then(
                function (response) {
                    if (response.err) {
                        daoTransactionStepCreate.create('preauthStatus', response.err.data['serial-number'], response.err.data['merchant-order-id'], response.err.data['paynet-order-id'], data, response.err.msg, response.err.data);
                        clientServerHelpers.rejectTransaction(data, response.err.msg);
                        return when.resolve();
                    } else if (response.data.processing) {
                        daoTransactionStepCreate.create('preauthStatus', response.data.data['serial-number'], response.data.data['merchant-order-id'], response.data.data['paynet-order-id'], data, null, response.data.data);
                        return when.reject();
                    } else {
                        daoTransactionStepCreate.create('preauthStatus', response.data.data['serial-number'], response.data.data['merchant-order-id'], response.data.data['paynet-order-id'], data, null, response.data.data);

                        data.cardType = response.data.card.cardType;
                        data.cardBankName = response.data.card.bankName;
                        data.cardLastFourDigits = response.data.card.lastFourDigits;

                        return daoTransactionUpdate.update(data)
                            .then(function(){
                                registerCardHelper(data);
                            });
                    }
                },
                function (err) {
                    logger.error('preauthStatus err', err);
                }
            );
    });

    // С makeRebillPreauth проще, т.к. не нужно использовать callMe, потому что нужные нам данные приходят в makeRebillPreauthStatus, а дальше wireTransfer и по накатаной
    function makeRebillPreauth (data) {
        var transactionUuid = data.transactionUuid;

        //makeRebillPreauthReq
        //makeRebillPreauthStatusReq

        // Запрос на холдирование средств на карте по привязаной карте
        makeRebillPreauthReq(data).then(
                function(response){
                    if (!response.err) {
                        // Ok!
                        response = response.data;
                        return daoTransactionStepCreate.create('makeRebillPreauth', response.pneReqSerialNumber, transactionUuid, response.preauthPneId, data, null, response.data)
                            .then(function(){
                                data.preauthPneId = response.preauthPneId;
                                return daoTransactionUpdate.update(data);
                            });
                    } else {
                        // Err
                        return daoTransactionStepCreate.create('makeRebillPreauth', response.err.data['serial-number'], transactionUuid, null,data, response.err.msg, response.err.data)
                            .then(function(){
                                return when.reject(response.err.msg);
                            });
                    }
                }
            )
            // Откат если произошла ошибка холдирования средств на карте по привязаной карте
            .then(
                null,
                function(err){
                    if (_.isPlainObject(err)) {
                        queue[transactionUuid].reject(new HandledError(200, err.err, err.data));
                    } else {
                        queue[transactionUuid].reject(err);
                    }
                    cleanQueue(transactionUuid);
                    return when.reject();
                }
            )
            // Получаем HTML
            .then(function(){
                (function doMakeRebillPreauthStatusReq () {
                    makeRebillPreauthStatusReq(data)
                        .then(
                            function (response) {
                                if (response.err) {
                                    daoTransactionStepCreate.create('makeRebillPreauthStatus', response.err.data['serial-number'], response.err.data['merchant-order-id'], response.err.data['paynet-order-id'], data, response.err.msg, response.err.data);
                                    return when.reject(response.err.msg);
                                } else {
                                    daoTransactionStepCreate.create('makeRebillPreauthStatus', response.data.data['serial-number'], response.data.data['merchant-order-id'], response.data.data['paynet-order-id'], data, null, response.data.data);
                                    if (response.data.html) {
                                        queue[transactionUuid].res.send({
                                            transactionUuid: transactionUuid,
                                            html: response.data.html.replace(/\r\n/ig, '')
                                        });

                                        queue[transactionUuid].resolve();
                                        cleanQueue(transactionUuid);

                                        callMe.poll('makeRebillPreauthStatus', data.userUuid, [10,10,10,10,10,10,10,60,60,60,60,60,60,60,600,600,600,600,600,600,600,3600], data);
                                    } else {
                                        setTimeout(doMakeRebillPreauthStatusReq, SEC);
                                    }
                                }
                            }
                        )
                        .catch(function (err) {
                            queue[transactionUuid].reject(err);
                            cleanQueue(transactionUuid);
                        })
                }());
            });
    }

    callMe.on('makeRebillPreauthStatus', function (data) {
        return makeRebillPreauthStatusReq(data)
            .then(
                function (response) {
                    if (response.err) {
                        daoTransactionStepCreate.create('makeRebillPreauthStatus', response.err.data['serial-number'], response.err.data['merchant-order-id'], response.err.data['paynet-order-id'], data, response.err.msg, response.err.data);
                        clientServerHelpers.rejectTransaction(data, response.err.msg);
                        return when.resolve();
                    } else if (response.data.processing) {
                        daoTransactionStepCreate.create('makeRebillPreauthStatus', response.data.data['serial-number'], response.data.data['merchant-order-id'], response.data.data['paynet-order-id'], data, null, response.data.data);
                        return when.reject();
                    } else {
                        daoTransactionStepCreate.create('makeRebillPreauthStatus', response.data.data['serial-number'], response.data.data['merchant-order-id'], response.data.data['paynet-order-id'], data, null, response.data.data);

                        return daoTransactionUpdate.update(data)
                            .then(function(){
                                wireHelper(data);
                            });
                    }
                },
                function (err) {
                    logger.error('makeRebillPreauthStatus', err);
                }
            );
    });

};