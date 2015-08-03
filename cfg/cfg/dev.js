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
        ENDPOINTS: {
            1: {
                login: 'mylogin',
                endpointid: 1,
                hostname: 'sandbox.payneteasy.com',
                control: '1ae8863f-42cf-48d1-8787-8601d832d51d'
            }
        }
    },

    CLIENT_SERVER: {
        DOMAIN: '127.0.0.1',
        PORT: 8088,
        PATH: '/api/v0.3.0/payment/status-cb'
    }

};

module.exports = CONFIG;