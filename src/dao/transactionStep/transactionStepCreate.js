"use strict";

var _ = require('lodash-node');
var when = require('when');
var logger = require(__modulesCustom + 'logger')('daoTransactionStepCreate');

var CONFIG = require(__cfg);

var db = CONFIG.db;

function create (req_type, serial_number, transactionUuid, pne_id, req, err, res) {
    return db.none('' +
        'INSERT INTO "transaction_step" ("transaction_uuid", "req_type", "serial_number", "pne_id", "req", "err", "res") VALUES (${transaction_uuid}, ${req_type}, ${serial_number}, ${pne_id}, ${req}, ${err}, ${res});',
        { transaction_uuid: transactionUuid, req_type: req_type, serial_number: serial_number, pne_id: pne_id, req: JSON.stringify(req), err: err, res: JSON.stringify(res)}
    )
        .then(
            null,
            function (err) {
                logger.error('transactionStepCreate.create', {err: err && err.stack || err, sqlData: {transactionUuid: transactionUuid, req_type: req_type, serial_number: serial_number, pne_id: pne_id, req: req, err: err, res: res}});
                return when.reject(err);
            }
        );
}

module.exports = {
    create: create
};