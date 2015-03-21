var fs = require('fs');

module.exports = function(req, res, next) {
    res.status(200).end();

    var keys = ['method', 'domain', 'url', 'params', 'query', 'body', 'headers', 'rawHeaders', 'statusCode', 'statusMessage', 'client', 'secret', 'cookies'],
        obj = {};

    try {
        keys.forEach(function (key) {
            try {
                obj[key] = JSON.stringify(req[key]);
            } catch (e) {
                console.log(key);
            }
        });
        console.log(JSON.stringify(obj, null, 4));
        fs.writeFileSync(
            'file-' + Date.now() + '-' + Math.floor(Math.random() * 100)+ '.txt',
            JSON.stringify(obj, null, 4),
            { encoding: 'utf8' }
        );
    } catch (e) {
        console.log(e);
    }

};
