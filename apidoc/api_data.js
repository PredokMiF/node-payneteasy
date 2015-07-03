define({ "api": [
  {
    "type": "POST",
    "url": "/api/v<APIVer>/pay",
    "title": "pay",
    "version": "0.0.1",
    "description": "<p>оплата по карте</p> ",
    "name": "Pay",
    "group": "Pay",
    "permission": [
      {
        "name": "all"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "userUuid",
            "description": "<p>идентификатор пользователя</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "transactionUuid",
            "description": "<p>идентификатор транзакции</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "country",
            "description": "<p>код страны (&quot;RU&quot;)</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "city",
            "description": "<p>город клиента</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "zipCode",
            "description": "<p>почтовый индекс</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "address1",
            "description": "<p>адрес клиента</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "phone",
            "description": "<p>телефон клиента</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "email",
            "description": "<p>почта клиента</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "desc",
            "description": "<p>назначение платежа</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "amount",
            "description": "<p>стоимость покупки. Точка - разделитель дробной части: 5482.19</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "currency",
            "description": "<p>валюта платежа(&quot;RUB&quot;)</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "ipaddress",
            "description": "<p>IP-адрес плательщика</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "redirectUrl",
            "description": "<p>адрес, куда нужно редитектнуть браузер пользователя, после того как он заполнит форму ввода карты и подтвердит её SMS'кой</p> "
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Начался процесс проведенияплатежа:",
          "content": "HTTP/1.1 200 OK\n{ done: 'Ok!' }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/v0.0.1/pay"
      }
    ],
    "filename": "src/api/pay_0.0.1.js",
    "groupTitle": "Pay",
    "error": {
      "fields": {
        "Формат ошибки": [
          {
            "group": "Формат ошибки",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "err",
            "description": "<p>Контейнер ошибки</p> "
          },
          {
            "group": "Формат ошибки",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "err.msg",
            "description": "<p>Сообщение об ошибки</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Что-то пошло не так:",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        },
        {
          "title": "Не задана версия API:",
          "content": "HTTP/1.1 404 Not found",
          "type": "json"
        },
        {
          "title": "Не задана существующая версия API:",
          "content": "HTTP/1.1 404 Not found\nДанная версия API не существуется или более не поддерживается",
          "type": "json"
        },
        {
          "title": "Не задана версия API:",
          "content": "HTTP/1.1 404 Not found",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "POST",
    "url": "/api/v<APIVer>/login",
    "title": "login",
    "version": "0.3.0",
    "description": "<p>Авторизация пользователя. Стандартные коды ошибок: USER_NOT_FOUND, USER_PASS_INCORRECT, USER_DELETED</p> ",
    "name": "Login",
    "group": "Security",
    "permission": [
      {
        "name": "none"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "email",
            "description": "<p>логин пользователя</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "pass",
            "description": "<p>пароль пользователя</p> "
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Пользователь авторизован:",
          "content": "HTTP/1.1 200 OK\n{\n    uuid: '1e9dbccf-6484-4e8c-bc9f-5560186dd043'\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Забыли передать пароль:",
          "content": "HTTP/1.1 200 OK\n{\n    \"err\": {\n        \"msg\": \"`pass` not set\"\n    }\n}",
          "type": "json"
        },
        {
          "title": "Пользователь с такими логином не найден:",
          "content": "HTTP/1.1 200 OK\n{\n    \"err\": {\n        \"msg\": \"Пользователь не найден\",\n        \"extra\": {\n            \"ERROR_MSG_CODE\": \"USER_NOT_FOUND\"\n        }\n    }\n}",
          "type": "json"
        },
        {
          "title": "Не верный пароль:",
          "content": "HTTP/1.1 200 OK\n{\n    \"err\": {\n        \"msg\": \"Не верный пароль\",\n        \"extra\": {\n            \"ERROR_MSG_CODE\": \"USER_PASS_INCORRECT\"\n        }\n    }\n}",
          "type": "json"
        },
        {
          "title": "Что-то пошло не так:",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        },
        {
          "title": "Не задана версия API:",
          "content": "HTTP/1.1 404 Not found",
          "type": "json"
        },
        {
          "title": "Не задана существующая версия API:",
          "content": "HTTP/1.1 404 Not found\nДанная версия API не существуется или более не поддерживается",
          "type": "json"
        },
        {
          "title": "Не задана версия API:",
          "content": "HTTP/1.1 404 Not found",
          "type": "json"
        }
      ],
      "fields": {
        "Формат ошибки": [
          {
            "group": "Формат ошибки",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "err",
            "description": "<p>Контейнер ошибки</p> "
          },
          {
            "group": "Формат ошибки",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "err.msg",
            "description": "<p>Сообщение об ошибки</p> "
          }
        ]
      }
    },
    "sampleRequest": [
      {
        "url": "/api/v0.3.0/login"
      }
    ],
    "filename": "src/api/security/apiLogin_0.3.0.js",
    "groupTitle": "Security"
  },
  {
    "type": "POST",
    "url": "/api/v<APIVer>/loginSoc",
    "title": "loginSoc",
    "version": "0.3.0",
    "description": "<p>Авторизация пользователя по токену соц.сети. Стандартные коды ошибок: VK_RES_PARSE_ERROR, VK_RES_ERROR, FB_RES_PARSE_ERROR, FB_RES_ERROR</p> ",
    "name": "LoginSoc",
    "group": "Security",
    "permission": [
      {
        "name": "none"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "socType",
            "description": "<p>соц. сеть 'vk', 'fb'</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "token",
            "description": "<p>токен соц. сети</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "email",
            "description": "<p>почта пользователя</p> "
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Пользователь авторизован:",
          "content": "HTTP/1.1 200 OK\n{\n    uuid: '1e9dbccf-6484-4e8c-bc9f-5560186dd043'\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Забыли передать тип соц. сети:",
          "content": "HTTP/1.1 200 OK\n{\n    \"err\": {\n        \"msg\": \"`socType` not set\"\n    }\n}",
          "type": "json"
        },
        {
          "title": "Тип соц. сети должен быть обним из 'vk', 'fb':",
          "content": "HTTP/1.1 200 OK\n{\n    \"err\": {\n        \"msg\": \"В `socType` передан неизвестный тип\"\n    }\n}",
          "type": "json"
        },
        {
          "title": "Токен соц. сети не передан:",
          "content": "HTTP/1.1 200 OK\n{\n    \"err\": {\n        \"msg\": \"`token` not set\"\n    }\n}",
          "type": "json"
        },
        {
          "title": "Ошибка сервера VK:",
          "content": "HTTP/1.1 200 OK\n{\n    \"err\": {\n        \"msg\": \"VK: Ошибка ответа сервера\",\n        {\n            \"ERROR_MSG_CODE\": \"VK_RES_ERROR\"\n        }\n    }\n}",
          "type": "json"
        },
        {
          "title": "Что-то пошло не так:",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        },
        {
          "title": "Не задана версия API:",
          "content": "HTTP/1.1 404 Not found",
          "type": "json"
        },
        {
          "title": "Не задана существующая версия API:",
          "content": "HTTP/1.1 404 Not found\nДанная версия API не существуется или более не поддерживается",
          "type": "json"
        },
        {
          "title": "Не задана версия API:",
          "content": "HTTP/1.1 404 Not found",
          "type": "json"
        }
      ],
      "fields": {
        "Формат ошибки": [
          {
            "group": "Формат ошибки",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "err",
            "description": "<p>Контейнер ошибки</p> "
          },
          {
            "group": "Формат ошибки",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "err.msg",
            "description": "<p>Сообщение об ошибки</p> "
          }
        ]
      }
    },
    "sampleRequest": [
      {
        "url": "/api/v0.3.0/loginSoc"
      }
    ],
    "filename": "src/api/security/apiLoginSoc_0.3.0.js",
    "groupTitle": "Security"
  },
  {
    "type": "POST",
    "url": "/api/v<APIVer>/make-me-vip",
    "title": "make me vip",
    "version": "0.3.0",
    "description": "<p>Сообщает что этот пользователь совершил покупку</p> ",
    "name": "MakeMeVip",
    "group": "Security",
    "permission": [
      {
        "name": "user"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Для пользователя установлен флаг внутренней покупки:",
          "content": "HTTP/1.1 200 OK\n{\n    done: 'Ok!'\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/v0.3.0/make-me-vip"
      }
    ],
    "filename": "src/api/security/apiMakeMeVip_0.3.0.js",
    "groupTitle": "Security",
    "error": {
      "fields": {
        "Формат ошибки": [
          {
            "group": "Формат ошибки",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "err",
            "description": "<p>Контейнер ошибки</p> "
          },
          {
            "group": "Формат ошибки",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "err.msg",
            "description": "<p>Сообщение об ошибки</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Что-то пошло не так:",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        },
        {
          "title": "Не задана версия API:",
          "content": "HTTP/1.1 404 Not found",
          "type": "json"
        },
        {
          "title": "Не задана существующая версия API:",
          "content": "HTTP/1.1 404 Not found\nДанная версия API не существуется или более не поддерживается",
          "type": "json"
        },
        {
          "title": "Не задана версия API:",
          "content": "HTTP/1.1 404 Not found",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "POST",
    "url": "/api/v<APIVer>/register",
    "title": "register",
    "version": "0.3.0",
    "description": "<p>Реистрация пользователя. Стандартные коды ошибок: USER_NOT_UNIQUE</p> ",
    "name": "Register",
    "group": "Security",
    "permission": [
      {
        "name": "none"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "email",
            "description": "<p>логин нового пользователя. Должно удовлетворять регулярке /^[-a-z0-9!#$%&amp;'<em>+/=?^_<code>{|}~]+(\\.[-a-z0-9!#$%&amp;'*+/=?^_</code>{|}~]+)</em>@(<a href=\"%5B-a-z0-9%5D%7B0,61%7D%5Ba-z0-9%5D\">a-z0-9</a>?.)*(aero|arpa|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|[a-z][a-z])$/i</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "pass",
            "description": "<p>пароль нового пользователя</p> "
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Пользователь зарегистрирован:",
          "content": "HTTP/1.1 200 OK\n{uuid:'1e9dbccf-6484-4e8c-bc9f-5560186dd043'}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Забыли передать пароль:",
          "content": "HTTP/1.1 200 OK\n{\n    \"err\": {\n        \"msg\": \"`pass` not set\"\n    }\n}",
          "type": "json"
        },
        {
          "title": "Такой пользователь уже существует:",
          "content": "HTTP/1.1 200 OK\n{\n    \"err\": {\n        \"msg\": \"Пользователь с таким email уже существует\",\n        \"extra\": {\n            \"ERROR_MSG_CODE\": \"USER_NOT_UNIQUE\"\n        }\n    }\n}",
          "type": "json"
        },
        {
          "title": "Что-то пошло не так:",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        },
        {
          "title": "Не задана версия API:",
          "content": "HTTP/1.1 404 Not found",
          "type": "json"
        },
        {
          "title": "Не задана существующая версия API:",
          "content": "HTTP/1.1 404 Not found\nДанная версия API не существуется или более не поддерживается",
          "type": "json"
        },
        {
          "title": "Не задана версия API:",
          "content": "HTTP/1.1 404 Not found",
          "type": "json"
        }
      ],
      "fields": {
        "Формат ошибки": [
          {
            "group": "Формат ошибки",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "err",
            "description": "<p>Контейнер ошибки</p> "
          },
          {
            "group": "Формат ошибки",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "err.msg",
            "description": "<p>Сообщение об ошибки</p> "
          }
        ]
      }
    },
    "sampleRequest": [
      {
        "url": "/api/v0.3.0/register"
      }
    ],
    "filename": "src/api/security/apiRegister_0.3.0.js",
    "groupTitle": "Security"
  },
  {
    "type": "POST",
    "url": "/api/v<APIVer>/restore",
    "title": "restore",
    "version": "0.3.0",
    "description": "<p>Восстановление пароля пользователя на почту. Стандартные коды ошибок: USER_NOT_FOUND, USER_DELETED</p> ",
    "name": "Restore",
    "group": "Security",
    "permission": [
      {
        "name": "none"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "email",
            "description": "<p>почтовый адрес пользователя /^[-a-z0-9!#$%&amp;'<em>+/=?^_<code>{|}~]+(\\.[-a-z0-9!#$%&amp;'*+/=?^_</code>{|}~]+)</em>@(<a href=\"%5B-a-z0-9%5D%7B0,61%7D%5Ba-z0-9%5D\">a-z0-9</a>?.)*(aero|arpa|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|[a-z][a-z])$/i</p> "
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Пароль выслан на почту:",
          "content": "HTTP/1.1 200 OK\n{done: 'Ok!'}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Забыли передать почту:",
          "content": "HTTP/1.1 200 OK\n{\n    \"err\": {\n        \"msg\": \"`email` not set\"\n    }\n}",
          "type": "json"
        },
        {
          "title": "Пользователя с такой почтой не существует:",
          "content": "HTTP/1.1 200 OK\n{\n    \"msg\": \"Пользователь не найден\",\n        \"extra\": {\n            \"ERROR_MSG_CODE\": \"USER_NOT_FOUND\"\n        }\n}",
          "type": "json"
        },
        {
          "title": "Что-то пошло не так:",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        },
        {
          "title": "Не задана версия API:",
          "content": "HTTP/1.1 404 Not found",
          "type": "json"
        },
        {
          "title": "Не задана существующая версия API:",
          "content": "HTTP/1.1 404 Not found\nДанная версия API не существуется или более не поддерживается",
          "type": "json"
        },
        {
          "title": "Не задана версия API:",
          "content": "HTTP/1.1 404 Not found",
          "type": "json"
        }
      ],
      "fields": {
        "Формат ошибки": [
          {
            "group": "Формат ошибки",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "err",
            "description": "<p>Контейнер ошибки</p> "
          },
          {
            "group": "Формат ошибки",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "err.msg",
            "description": "<p>Сообщение об ошибки</p> "
          }
        ]
      }
    },
    "sampleRequest": [
      {
        "url": "/api/v0.3.0/restore"
      }
    ],
    "filename": "src/api/security/apiRestore_0.3.0.js",
    "groupTitle": "Security"
  },
  {
    "type": "POST",
    "url": "/api/v<APIVer>/logout",
    "title": "logout",
    "version": "0.3.0",
    "description": "<p>Логаут (деавторизация)</p> ",
    "name": "logout",
    "group": "Security",
    "permission": [
      {
        "name": "user"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Пользователь вышел:",
          "content": "HTTP/1.1 200 OK\n{done: 'Ok!'}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/v0.3.0/logout"
      }
    ],
    "filename": "src/api/security/apiLogout_0.3.0.js",
    "groupTitle": "Security",
    "error": {
      "fields": {
        "Формат ошибки": [
          {
            "group": "Формат ошибки",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "err",
            "description": "<p>Контейнер ошибки</p> "
          },
          {
            "group": "Формат ошибки",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "err.msg",
            "description": "<p>Сообщение об ошибки</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Что-то пошло не так:",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        },
        {
          "title": "Не задана версия API:",
          "content": "HTTP/1.1 404 Not found",
          "type": "json"
        },
        {
          "title": "Не задана существующая версия API:",
          "content": "HTTP/1.1 404 Not found\nДанная версия API не существуется или более не поддерживается",
          "type": "json"
        },
        {
          "title": "Не задана версия API:",
          "content": "HTTP/1.1 404 Not found",
          "type": "json"
        }
      ]
    }
  }
] });