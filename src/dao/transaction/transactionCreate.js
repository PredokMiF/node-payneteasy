"use strict";

var _ = require('lodash-node');
var when = require('when');
var logger = require(__modulesCustom + 'logger')('daoTransactionCreate');

var CONFIG = require(__cfg);

var db = CONFIG.db;

function create (transactionData) {
    return db.none('' +
        'INSERT INTO "transaction" ("uuid", "data") VALUES (${uuid}, ${json});',
        { uuid: transactionData.transactionUuid, json: JSON.stringify(transactionData) }
    )
        .then(
            null,
            function (err) {
                logger.error('transactionCreate.create', {err: err && err.stack || err, sqlData: transactionData});
                return when.reject(err);
            }
        );
}

module.exports = {
    create: create
};