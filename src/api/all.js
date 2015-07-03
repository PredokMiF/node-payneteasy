"use strict";

/**
 * @apiDefine RestErrorFormat_v0_2_0
 *
 * @apiError (Формат ошибки) {Object} err Контейнер ошибки
 * @apiError (Формат ошибки) {String} err.msg Сообщение об ошибки
 *
 * @apiErrorExample {json} Что-то пошло не так:
 *      HTTP/1.1 500 Internal Server Error
 *
 * @apiErrorExample {json} Не задана версия API:
 *      HTTP/1.1 404 Not found
 *
 * @apiErrorExample {json} Не задана существующая версия API:
 *      HTTP/1.1 404 Not found
 *      Данная версия API не существуется или более не поддерживается
 *
 * @apiErrorExample {json} Не задана версия API:
 *      HTTP/1.1 404 Not found
 *
 */

module.exports = function (app) {

    require('./pay_0.0.1')(app);
};