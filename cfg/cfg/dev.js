"use strict";

var CONFIG = {

    //DB_CONN_STR: 'postgres://postgres:1@localhost:5432/nrj',
    DB_CONN_OBJ: {
        user: 'postgres',
        password: '1',
        database: 'payneteasy',
        host: 'localhost',
        port: 5432
    },

    // Папка с dbUpdater скриптами
    DB_UPDATER_SRC: 'src/dao/dbUpdater',

    PAYNETEASY: {
        //CLIENT_ORDER_ID: 'qwe'
    },

    CLIENT_SERVER: {
        DOMAIN: '127.0.0.1',
        PORT: 8088,
        PATH: '/api/v0.2.0/payment/status-cb'
    }

};

module.exports = CONFIG;