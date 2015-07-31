"use strict";

var _ = require('lodash-node');
var when = require('when');

var CONFIG = require(__cfg);

var db = CONFIG.db;

function create (transactionData) {
    return db.none('' +
        'INSERT INTO "transaction" ("uuid", "data") VALUES (${uuid}, ${json});',
        { uuid: transactionData.transactionUuid, json: JSON.stringify(transactionData) }
    );
}

module.exports = {
    create: create
};