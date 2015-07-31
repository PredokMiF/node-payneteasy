$.ajax({
    type: 'POST',
    contentType: 'application/json',
    url: '/api/v0.1.0/pay',
    dataType: 'json',
    data: JSON.stringify({
        endpointid: '1',
        transactionUuid: 'b9fdec6a-6895-479d-9464-' + Date.now().toString().substr(1),
        amount: '1',
        comission: '0.52',
        orderDesc: 'orderDesc 1.52',
        userUuid: '5c9ca297-bce1-445c-9e07-da3a136039c2',
        payer_fullname: 'payer_fullname',
        payer_identityDocument: '01,0000999999',
        payer_email: 'qq@ww.ru',
        payer_city: 'payer_city',
        payer_zipCode: '000000',
        payer_address1: 'payer_address1',
        payer_ipaddress: '127.0.0.1',
        recipient_name: 'recipient_name',
        recipient_inn: '7812013775',
        recipient_accountNumber: '40702810000000005464',
        recipient_bankBic: '044030861',
        redirectUrl: 'http://ya.ru/'
    })
}).then(
    function(data){
        console.log(JSON.stringify(data, null, 4));
    },
    function(err){
        console.log(JSON.stringify(err.responseJSON, null, 4));
    }
);
''
