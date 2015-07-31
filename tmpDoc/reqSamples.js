//    //DEBUG START
//    function(){
//        var reqData = {
//
//        // Перевод
//
///* R */     endpointid: 815,
//            // Transaction UUID (Пользовательский идентификатор заказа.) (128/String)
///* R */     transactionUuid: '522a5e84-3193-41d1-9d7b-5921a1c20a90', /* DATA REQUIRED */
//            // id транзакции у PayNetEasy. Появится после <кто-то>Request: preauthReq, captureReq, wireTransferReq, cardRegReq
///* ПОТОМ */ preauthPneId: '',
///* ПОТОМ */ preauthStatusPneId: [''],
///* ПОТОМ */ capturePneId: '',
///* ПОТОМ */ captureStatusPneId: [],
///* ПОТОМ */ wireTransferPneId: '',
///* ПОТОМ */ wireTransferStatusPneId: [],
//
///* ПОТОМ */ returnPneId: '',
///* ПОТОМ */ returnStatusPneId: [],
//
///* ПОТОМ */ cardRegPneId: '',
//            // Сумма перевода (целевой платеж). Копейки от рублей отделяются точкой. Например 10.5 (10/Numeric)
///* R */     amount: 1, /* DATA REQUIRED */
//            // Сумма которую ПО зажимает себе. Копейки от рублей отделяются точкой. Например 10.5 (10/Numeric)
///* R */     comission: 0.52, /* DATA REQUIRED */
//            // НДС (сумма) (10/Numeric)
///* D */     NDS: 0,
//            // Трехзначный код валюты платежа, например RUB (3/String)
///* D */     currency: 'RUB',
//            // Назначение платежа (125/String)
///* R */     'orderDesc': 'orderDesc!',
//            // Комментарий перевода по зарег. карте (50/String)
//            //makeRebillComment: '',
//            // Комментарий отмеры транзакции (50/String)
///* D */     returnComment: 'Transaction error',
//
//        // Плательщик
//
//            // UUID плательщика
///* R */     userUuid: 'qwe-qwe-qwe',
//            // Customer’s first name (50/String)
//            //payer_firstName: '',
//            // Customer’s last name (50/String)
//            //payer_lastName: '',
//            // ФИО плательщика (128/String)
///* R */     payer_fullname: 'Фио Фио Фиович',
//            // Customer’s date of birth, in the format YYYYMMDD. (6/Numeric)
//            //payer_birthday: '',
//            // Тип, серия и номер документа, удостоверяющего личность. Укажите нужный тип документа (2 цифры) + запятая + символы от 4 до 64 (64/String)
///* R */     payer_identityDocument: '01,1111123123',
//            // Last four digits of the customer’s social security number. (4/Numeric)
//            //payer_ssn: '',
//            // E-mail плательщика (128/String)
///* R */     payer_email: 'email@mail.ru', /* DATA REQUIRED */
//            // Телефон плательщика (15/String)
//            //payer_phone: '',
//            // Полный телефон плательщика, вместе с кодом города (15/String)
//            //payer_cellPhone: '',
//            // Код страны плательщика (2/String)
///* D */     payer_country: 'RU', /* DEFAULT */
//            // Customer’s state (two-letter US state code). Please see Appendix A for a list of valid US state codes. Not applicable outside the US. (2/String)
//            //payer_state: '',
//            // Город плательщика (50/String)
///* R */     payer_city: 'city', /* DATA REQUIRED */
//            // Почтовый индекс плательщика (10/String)
//            //payer_zipCode: '000000', /* DATA REQUIRED */
///* R */     payer_zipCode: '420107', /* DATA REQUIRED */
//            // Адрес плательщика (50/String)
///* R */     payer_address1: 'address1!', /* DATA REQUIRED */
//            // IP адрес плательщика (20/String)
///* R */     payer_ipaddress: '127.0.0.0', /* DATA REQUIRED */
//            // ID карты плательщика, по которой нужно провести оплату
//            //payer_cardId: '',
//
//        // Карта плательщика
//
///* ПОТОМ */ cardId: '1326586',
///* ПОТОМ */ cardType: 'VISA',
///* ПОТОМ */ cardBankName: 'ALFA BANK',
///* ПОТОМ */ cardLastFourDigits: '9651',
//            cvv2: '',
//
//        // Получатель
//
//            // Получатель платежа (255/String)
///* R */     recipient_name: 'recipient Name name',
//            // ИНН получателя (255/String)
///* R */     recipient_inn: '123123123',
//            // Номер счета получателя (20/Numeric)
///* R */     recipient_accountNumber: '123123123',
//            // БИК банка получателя (9/Numeric)
///* R */     recipient_bankBic: '123123',
//
//        // Остальное
//
//            // URL the cardholder will be redirected to upon completion of the transaction. Please note that the cardholder will be redirected in any case, no matter whether the transaction is approved or declined. (128/String)
///* R */     redirectUrl: 'http://ya.ru' /* DATA REQUIRED */
//            // URL the original sale is made from. (128/String)
//            //siteUrl: ''
//            // URL the transaction result will be sent to. Merchant may use this URL for custom processing of the transaction completion, e.g. to collect sales data in Merchant’s database. See more details at Merchant Callbacks (128/String)
//            //serverCallbackUrl: ''
//        };
//
//
//
//        //var req = require(__pne + 'preauthReq');
//        //var req = require(__pne + 'preauthStatusReq');
//
//        //var req = require(__pne + 'makeRebillPreauthReq');
//        //var req = require(__pne + 'makeRebillPreauthStatusReq');
//
//        //var req = require(__pne + 'regCardReq');
//
//        //var req = require(__pne + 'returnReq');
//        //var req = require(__pne + 'returnStatusReq');
//
//        //var req = require(__pne + 'captureReq');
//        //var req = require(__pne + 'captureStatusReq');
//
//        //var req = require(__pne + 'wireTransferReq');
//        //var req = require(__pne + 'wireTransferStatusReq');
//
//        /*req(reqData)
//            .then(
//                function(data){
//                    console.log('data');
//                    console.log(data);
//                },
//                function(err){
//                    console.log('err');
//                    console.log(err);
//                }
//            );*/
//    },
//    // DEBUG END