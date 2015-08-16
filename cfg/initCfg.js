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
var logger = require(__modulesCustom + 'logger');

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

            DB_UPDATER_SRC: Joi.string(),

            PAYNETEASY: Joi.object().keys({
                ENDPOINTS: Joi.object().pattern(/\d+/i, Joi.object().keys({
                    login: Joi.string().min(1).required(),
                    endpointid: [Joi.string().min(1).required(), Joi.number().min(1).required()],
                    hostname: Joi.string().min(1).required(),
                    control: Joi.string().guid().required()
                }).requiredKeys('login', 'endpointid', 'hostname', 'control'))
            }).requiredKeys('ENDPOINTS'),

            CLIENT_SERVER: Joi.object().keys({
                DOMAIN: Joi.string().min(1),
                PORT: Joi.number().integer(),
                PATH: Joi.string().min(1)
            }),

            LOGGER: Joi.object().keys({
                DIR: Joi.string().min(1),
                MAX_FILE_SIZE: Joi.number().integer().min(1),
                LEVELS: Joi.array().min(1).items(Joi.string().valid('debug', 'info', 'warn', 'error'))
            }).requiredKeys('DIR', 'MAX_FILE_SIZE', 'LEVELS')

        }).requiredKeys('DB_UPDATER_SRC', 'PAYNETEASY', 'CLIENT_SERVER', 'LOGGER').without('DB_CONN_STR', ['DB_CONN_OBJ']);

        Joi.validate(
            require(path.join(__cfgDir, 'cfg', process.argv[cfgKeyPos + 1])),
            CFG_SCHEMA,
            {abortEarly : true},
            function (err, cfg) {
                if (err) {
                    reject(err);
                } else {
                    cfg.DB_CONN = cfg.DB_CONN_OBJ || cfg.DB_CONN_STR;
                    // Самый первый вызов. На самом деле вызываться для получения конфига будет именно __cfg, туда мы и копируем наши параметры
                    CONFIG = _.defaults(require(__cfg), cfg);
                    resolve(cfg);
                }
            }
        );
})

    /* ================================================================================================= */
    /* ============================================= logger ============================================ */
    /* ================================================================================================= */
    .then(function () {
        logger.init({
            LOG_DIR: CONFIG.LOGGER.DIR,
            MAXSIZE: CONFIG.LOGGER.MAX_FILE_SIZE,
            LOG_LEVELS: CONFIG.LOGGER.LEVELS
        });
    })

    /* ================================================================================================= */
    /* ============================================= pgpLib ============================================ */
    /* ================================================================================================= */
    .then(function () {
        var pgp = pgpLib({
            promiseLib: when
        });
        CONFIG.db = pgp(CONFIG.DB_CONN);
    })

    /* ================================================================================================= */
    /* =========================================== DbUpdater =========================================== */
    /* ================================================================================================= */
    .then(function () {
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
    })
    .then(function(){
        return callMe.init(CONFIG.DB_CONN);
    });
;
