"use strict";

var _ = require('lodash-node');
var path = require('path');
var fs = require('fs');
var util = require('util');
var Joi = require('joi');
var when = require('when');
//var pgpLib = require('pg-promise');
//var DbUpdater = require('dbUpdater');

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
            PAYNETEASY: Joi.object().keys({
                //CLIENT_ORDER_ID: Joi.string().min(1).max(128)
            }),

            // Файл временной БД
            TEMP_FILE_DB_PATH: Joi.string().min(1),

            CLIENT_SERVER: Joi.object().keys({
                DOMAIN: Joi.string().min(1),
                PORT: Joi.number().integer(),
                PATH: Joi.string().min(1)
            })

            // DB
            //DB_CONN_STR: Joi.string(),
            //DB_CONN_OBJ: Joi.object().keys({
            //    user: Joi.string().min(1),
            //    password: Joi.string(),
            //    database: Joi.string().min(1),
            //    host: Joi.string().min(1),
            //    port: Joi.number().integer()
            //}),
            // DB_UPDATER
            //DB_UPDATER_SRC: Joi.string()
        })/*.requiredKeys('DB_UPDATER_SRC').without('DB_CONN_STR', ['DB_CONN_OBJ'])*/;

        Joi.validate(
            require(path.join(__cfgDir, 'cfg', process.argv[cfgKeyPos + 1])),
            CFG_SCHEMA,
            {abortEarly : true},
            function (err, cfg) {
                if (err) {
                    reject(err);
                } else {
                    cfg.DB_CONN = cfg.DB_CONN_OBJ || cfg.DB_CONN_STR;
                    CONFIG = cfg;
                    // Самый первый вызов
                    CONFIG = _.defaults(require(__cfg), cfg);
                    resolve(cfg);
                }
            }
        );
})

    .then(function () {
        var def = when.defer(),
            dateObj;
        fs.stat(CONFIG.TEMP_FILE_DB_PATH, function (err, stat) {
            if (err && err.code === 'ENOENT') {
                fs.writeFileSync(CONFIG.TEMP_FILE_DB_PATH, JSON.stringify({
                    payments: []
                }));
            } else if (err) {
                def.reject(err);
                return;
            }

            dateObj = JSON.parse(fs.readFileSync(CONFIG.TEMP_FILE_DB_PATH));

            def.resolve();
        });

        CONFIG.dbGetSync = dbGetSync;
        CONFIG.dbSetSync = dbSetSync;

        return def;

        function dbGetSync () {
            return dateObj;
        }

        function dbSetSync (obj) {
            fs.writeFileSync(CONFIG.TEMP_FILE_DB_PATH, JSON.stringify(obj, null, 4));
        }
    })

    /* ================================================================================================= */
    /* ============================================= pgpLib ============================================ */
    /* ================================================================================================= */
    //.then(function () {
    //    var pgp = pgpLib({
    //        promiseLib: when
    //    });
    //    CONFIG.db = pgp(CONFIG.DB_CONN);
    //    return when.resolve();
    //})

    /* ================================================================================================= */
    /* =========================================== DbUpdater =========================================== */
    /* ================================================================================================= */
    //.then(function () {
    //    var def = when.defer();
    //
    //    var dbUpdater = DbUpdater({
    //        taskReader: DbUpdater.TaskReaderFile({path: CONFIG.DB_UPDATER_SRC}),
    //        taskSaver: DbUpdater.TaskSaverPostgreSQL({connString: CONFIG.DB_CONN, dbTable: 'dbupdater'}),
    //        taskExecutors: [
    //            DbUpdater.TaskExecPostgresFileJs({connString: CONFIG.DB_CONN}),
    //            DbUpdater.TaskExecPostgresFileSql({connString: CONFIG.DB_CONN})
    //        ]
    //    });
    //
    //    dbUpdater.init(function (err) {
    //        if (err) {
    //            def.reject(err);
    //        } else {
    //            def.resolve();
    //        }
    //    });
    //
    //    return def.promise;
    //})
;
