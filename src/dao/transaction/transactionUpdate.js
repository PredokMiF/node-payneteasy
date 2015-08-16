"use strict";

var _ = require('lodash-node');
var when = require('when');
var logger = require(__modulesCustom + 'logger')('daoTransactionUpdate');

var CONFIG = require(__cfg);

var db = CONFIG.db;

function update (transactionData) {
    return db.none('' +
        'UPDATE "transaction" SET "data" = ${json} WHERE "uuid" = ${uuid};',
        { uuid: transactionData.transactionUuid, json: JSON.stringify(transactionData) }
    )
        .then(
            null,
            function (err) {
                logger.error('transactionUpdate.update', {err: err && err.stack || err, sqlData: transactionData});
                return when.reject(err);
            }
        );
}

module.exports = {
    update: update
};