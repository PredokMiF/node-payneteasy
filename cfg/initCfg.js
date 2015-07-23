"use strict";

var _ = require('lodash-node');
var path = require('path');
var fs = require('fs');
var util = require('util');
var Joi = require('joi');
var when = require('when');
var pgpLib = require('pg-promise');
var DbUpdater = require('dbupdater');
var callMe = require(__modulesCustom + 'callMe');

var CFG_KEY = '-cfg';
var CONFIG;

/* ================================================================================================= */
/* ========================= Ищем файл настройки по переданным параметрам ========================== */
/* ================================================================================================= */
module.exports = when.promise(function(resolve, reject){
        var cfgKeyPos = process.argv.indexOf(CFG_KEY);

        if (cfgKeyPos === -1) {
            reject(new Error('При запуске приложения не указан ключ -cfg'));
            return;
        } else if (cfgKeyPos === process.argv.length - 1) {
            reject(new Error('При запуске приложения не указано значение для ключа -cfg'));
            return;
        } else if (!fs.existsSync(path.join(__cfgDir, 'cfg', process.argv[cfgKeyPos + 1]) + '.js')) {
            reject(new Error(util.format('Конфигурация сервера с именем %s не найден', process.argv[cfgKeyPos + 1])));
            return;
        }

        /* ================================================================================================= */
        /* =================================== Валидируем файл настройки =================================== */
        /* ================================================================================================= */
        var CFG_SCHEMA = Joi.object().keys({

            // DB
            DB_CONN_STR: Joi.string(),
            DB_CONN_OBJ: Joi.object().keys({
                user: Joi.string().min(1),
                password: Joi.string(),
                database: Joi.string().min(1),
                host: Joi.string().min(1),
                port: Joi.number().integer()
            }),

            // DB_UPDATER
            DB_UPDATER_SRC: Joi.string(),

            PAYNETEASY: Joi.object().keys({
                ENDPOINTS: Joi.object().pattern(/\d+/i, Joi.object().keys({
                    login: Joi.string().min(1).required(),
                    endpoint: [Joi.string().min(1).required(), Joi.number().min(1).required()],
                    hostname: Joi.string().min(1).required(),
                    control: Joi.string().guid().required()
                }).requiredKeys('login', 'endpoint', 'hostname', 'control'))
                //CLIENT_ORDER_ID: Joi.string().min(1).max(128)
            }).requiredKeys('ENDPOINTS'),

            CLIENT_SERVER: Joi.object().keys({
                DOMAIN: Joi.string().min(1),
                PORT: Joi.number().integer(),
                PATH: Joi.string().min(1)
            })
        }).requiredKeys('DB_UPDATER_SRC', 'PAYNETEASY', 'CLIENT_SERVER').without('DB_CONN_STR', ['DB_CONN_OBJ']);

        Joi.validate(
            require(path.join(__cfgDir, 'cfg', process.argv[cfgKeyPos + 1])),
            CFG_SCHEMA,
            {abortEarly : true},
            function (err, cfg) {
                if (err) {
                    reject(err);
                } else {
                    cfg.DB_CONN = cfg.DB_CONN_OBJ || cfg.DB_CONN_STR;
                    // Самый первый вызов
                    CONFIG = _.defaults(require(__cfg), cfg);
                    resolve(cfg);
                }
            }
        );
})

    /* ================================================================================================= */
    /* ============================================= pgpLib ============================================ */
    /* ================================================================================================= */
    /*.then(function () {
        var pgp = pgpLib({
            promiseLib: when
        });
        CONFIG.db = pgp(CONFIG.DB_CONN);
    })*/

    /* ================================================================================================= */
    /* =========================================== DbUpdater =========================================== */
    /* ================================================================================================= */
    /*.then(function () {
        var def = when.defer();

        var dbUpdater = DbUpdater({
            taskReader: DbUpdater.TaskReaderFile({path: CONFIG.DB_UPDATER_SRC}),
            taskSaver: DbUpdater.TaskSaverPostgreSQL({connString: CONFIG.DB_CONN, dbTable: 'dbupdater'}),
            taskExecutors: [
                DbUpdater.TaskExecPostgresFileJs({connString: CONFIG.DB_CONN}),
                DbUpdater.TaskExecPostgresFileSql({connString: CONFIG.DB_CONN})
            ]
        });

        dbUpdater.init(function (err) {
            if (err) {
                def.reject(err);
            } else {
                def.resolve();
            }
        });

        return def.promise;
    })*/
    /*.then(function(){
        return callMe.init(CONFIG.DB_CONN);
    })*/;
;
