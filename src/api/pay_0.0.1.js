"use strict";

var when = require('when');

var CONFIG = require(__cfg);

var ApiSecurity = require(__modulesCustom + 'api-security');

module.exports = function (app) {

    /**
     * @api {POST} /api/v<APIVer>/pay pay
     * @apiVersion 0.0.1
     * @apiDescription оплата по карте
     * @apiName Pay
     * @apiGroup Pay
     * @apiPermission all
     *
     * @apiParam {String} userUuid идентификатор пользователя
     * @apiParam {String} transactionUuid идентификатор транзакции
     * @apiParam {String} country код страны ("RU")
     * @apiParam {String} city город клиента
     * @apiParam {String} zipCode почтовый индекс
     * @apiParam {String} address1 адрес клиента
     * @apiParam {String} phone телефон клиента
     * @apiParam {String} email почта клиента
     * @apiParam {String} desc назначение платежа
     * @apiParam {Number} amount стоимость покупки. Точка - разделитель дробной части: 5482.19
     * @apiParam {String} currency валюта платежа("RUB")
     * @apiParam {String} ipaddress IP-адрес плательщика
     * @apiParam {String} redirectUrl адрес, куда нужно редитектнуть браузер пользователя, после того как он заполнит форму ввода карты и подтвердит её SMS'кой
     *
     * @apiSuccessExample {json} Начался процесс проведенияплатежа:
     *      HTTP/1.1 200 OK
     *      { done: 'Ok!' }
     *
     * @apiUse RestErrorFormat_v0_2_0
     *
     * @apiSampleRequest /api/v0.0.1/pay
     */

    app.post('/api/v:APIVer/pay', ApiSecurity({
        APIVer: '0.0.1',
        role: 'all',
        reqUrlValidate: {},
        reqQueryValidate: {},
        reqBodyValidate: {
            userUuid: 's reqKey min 1',
            transactionUuid: 's reqKey min 1',
            country: 's reqKey min 2',
            city: 's reqKey min 1',
            zipCode: 's reqKey min 1',
            address1: 's reqKey min 1',
            phone: 's reqKey',
            email: 's reqKey',
            desc: 's reqKey min 1',
            amount: 'n reqKey toNum toFixed 2 min 0.01',
            currency: 's reqKey min 2',
            ipaddress: 's reqKey min 1',
            redirectUrl: 's reqKey min 1'
        }
    }, function (req, res, next) {
        return when.promise(function(resolve, reject){
            var db = CONFIG.dbGetSync();

            var payment = {
                userUuid: req.body.userUuid,
                transactionUuid: req.body.transactionUuid,
                redirectUrl: req.body.redirectUrl,
                state: 'new',
                initData: {
                    client_orderid: req.body.transactionUuid,
                    country: req.body.country,
                    city: req.body.city,
                    zip_code: req.body.zipCode,
                    address1: req.body.address1,
                    phone: req.body.phone,
                    email: req.body.phone,
                    order_desc: req.body.desc,
                    amount: req.body.amount,
                    currency: req.body.currency,
                    ipaddress: req.body.ipaddress,
                    redirect_url: req.body.redirectUrl
                },
                payPath: {}
            };

            db.payments.push(payment);

            CONFIG.dbSetSync(db);

            res.send({done: 'Ok!'});

            resolve();
        });
    }));

};