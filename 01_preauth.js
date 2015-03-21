var https = require('https');
var crypto = require('crypto');
var querystring = require('querystring');

var config = {
    endpointid: 540,
    control: "FDC617AF-BCCC-4903-A2DE-9165AC2323F8"
};

var postConfig = {
        hostname: "sandbox.payneteasy.com",
        method: "POST",
        path: "/paynet/api/v2/preauth-form/" + config.endpointid,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    },

    params = {
        order_desc: "Оплата электроэнергии",
        client_orderid: '1', // id заказа в нашей базе
        address1: 'Client address',
        city: 'Kazan',
        zip_code: '420107',
        country: "RU",
        phone: '+7(919)888-99-15',
        email: 'grigorchuk.konstantin@gmail.com',
        amount: 123, // сумма
        currency: "RUB",
        ipaddress: '115.135.52.242',
        redirect_url: "http://energetika.projects.infoshell.ru:40687/",
        server_callback_url: "http://energetika.projects.infoshell.ru:40687/"
    };

function preauthForm (postConfig, postParams) {
    var data, log = '', post_req;

    postParams.control = getCheckSumm(config.endpointid, postParams.client_orderid, postParams.amount * 100, postParams.email, config.control);
    data = querystring.stringify(postParams);
    postConfig.headers['Content-Length'] = data.length;

    log += '______________config' + JSON.stringify(config, null, 4) + '\n\n';
    log += '______________postConfig' + JSON.stringify(postConfig, null, 4) + '\n\n';
    log += '______________postParams' + JSON.stringify(postParams, null, 4) + '\n\n';

    post_req = https.request(
        postConfig,
        function (res) {
            var out = '';
            res.on('data', function (chunk) {
                out = out + chunk;
            });
            res.on('end', function () {
                console.log('!!! end: ' + arguments);
                console.log('Out as is:  ' + out);
                out = querystring.parse(out);
                console.log('Out parsed: ' + out);
                Object.keys(out).forEach(function (key) {
                    out[key] = out[key].replace(/\n$/, '');
                });
                log += '______________response' + JSON.stringify(out, null, 4) + '\n\n';
                writeLog(log);
            });
        }
    );

    post_req.on('error', function (e) {
        log += '______________error' + e + '\n\n';
        writeLog(log);
    });
    post_req.write(data);
    post_req.end();
}

function getCheckSumm () {
    var shasum = crypto.createHash('sha1'),
        controlString = "", i;

    for (i = 0; i < arguments.length; i++) {
        controlString += arguments[i].toString();
    }
    shasum.update(controlString);

    return shasum.digest('hex');
}

function writeLog (data) {
    fs.writeFileSync(
        'file-' + Date.now() + '-' + Math.floor(Math.random() * 100)+ '.txt',
        data,
        { encoding: 'utf8' }
    );
    console.log(log);
}