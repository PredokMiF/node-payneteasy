"use strict";

var _ = require('lodash-node');
var https = require('https');
var querystring = require('querystring');

var sha1 = require(__modulesCustom + 'sha1');

var CONFIG = require(__cfg);

/**
 * Выполняет запрос к серверу PayNetEasy
 * @param cfg {Object}
 * @param cfg.endpointid {Number|String} - идентификатор терминала оплаты
 * @param cfg.path {String} - url Запроса. Подстрока "<endpointid>" будет заменена на нужный идентификатор
 * @param cfg.data {Object} - отправляемые данные
 * @param cfg.controlFields {Array} - массив данных или имен свойств (д.б. обернуты в массив). Данные будут браться сначала из конфига терминала, потом из данных на отправку
 * @param cb {function(err, object)} - колбэк запроса
 * @returns {*|Promise}
 */
function pneReq (cfg, cb) {
    var endpointCfg;
    if (
        // Конфигурация запроса
        !cfg || !_.isPlainObject(cfg) ||
            // endpointid строка или число
            (!_.isNumber(cfg.endpointid) && !_.isString(cfg.endpointid)) ||
                // есть терминал для этого endpointid
                !CONFIG.PAYNETEASY.ENDPOINTS.hasOwnProperty(cfg.endpointid) || !(endpointCfg = CONFIG.PAYNETEASY.ENDPOINTS[cfg.endpointid]) || !_.isPlainObject(endpointCfg) ||
            // path передан и корректен
            !_.isString(cfg.path) || !cfg.path.match(/^\/[a-z0-9\-\_]+[a-z0-9\-\_\/]*\<endpointid\>[a-z0-9\-\_\/]*$/i) ||
            // data передан и корректен
            !_.isPlainObject(cfg.data) || !_.every(cfg.data, function (val, key) { return _.isNumber(val) || _.isString(val)|| _.isNull(val)|| _.isUndefined(val);}) ||
            // controlFields передан и корректен
            !_.isArray(cfg.controlFields) || !_.every(cfg.controlFields, function(val){ return _.isString(val) || _.isNumber(val) || _.isArray(val) && val.length === 1 && _.isString(val[0]); }) ||
        // Колбэк запроса
        !_.isFunction(cb) || cb.length !== 2
    ) {
        throw new Error('PNE:pneReq invalid parameters');
    }

    var path = cfg.path.replace('<endpointid>', endpointCfg.endpointid);
    var data = _.transform(cfg.data, function (result, val, key) { if (_.isNumber(val) || _.isString(val) && val.length) {result[key] = val;}});
    var controlFields = _.map(cfg.controlFields, function (val) { return _.isArray(val) ? (endpointCfg[val] || data[val]) : val; });
    data.control = sha1.SHA1(controlFields.join('')).toString();
    data = querystring.stringify(data);

    var postReqHandler = https.request({
        hostname: endpointCfg.hostname,
        method: "POST",
        path: path,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length
        }
    }, function (res) {
        var out = '';
        res.on('data', function (chunk) {
            out = out + chunk;
        });
        res.on('end', function () {
            if (res.statusCode === 200) {
                out = querystring.parse(out);

                Object.keys(out).forEach(function (key) {
                    out[key] = out[key].replace(/\n$/, '');
                });

                cb(null, out);
            } else {
                cb(out, undefined);
            }
        });
    });

    postReqHandler.on('error', function (err) {
        cb(err, undefined);
    });
    postReqHandler.write(data);
    postReqHandler.end();
}

module.exports = pneReq;