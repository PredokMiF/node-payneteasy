"use strict";

var _ = require('lodash-node');
var when = require('when');

var CONFIG = require(__cfg);

var db = CONFIG.db;

function update (transactionData) {
    return db.none('' +
        'UPDATE "transaction" SET "data" = ${json} WHERE "uuid" = ${uuid};',
        { uuid: transactionData.transactionUuid, json: JSON.stringify(transactionData) }
    );
}

module.exports = {
    update: update
};