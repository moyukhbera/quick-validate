# quick-validate

###### Quick configurable API validations for Express.js

[![Travis Build](https://api.travis-ci.org/moyukhbera/quick-validate.svg)](https://travis-ci.org/github/moyukhbera/quick-validate) [![Coverage Status](https://coveralls.io/repos/github/moyukhbera/quick-validate/badge.svg?branch=master)](https://coveralls.io/github/moyukhbera/quick-validate?branch=master) [![Known Vulnerabilities](https://snyk.io/test/github/moyukhbera/quick-validate/badge.svg)](https://snyk.io/test/github/moyukhbera/quick-validate) [![Dependencies](https://david-dm.org/moyukhbera/quick-validate/status.svg)](https://david-dm.org/moyukhbera/quick-validate) [![Dev Dependencies](https://david-dm.org/moyukhbera/quick-validate/dev-status.svg)](https://david-dm.org/moyukhbera/quick-validate?type=dev) [![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)

### Features

- **Simple** - Provides a simple and quick way to configure API validations.
- **Clean** - Unlike other libraries, _quick-validate_ does not require you to write a lot of code for adding simple validations. It uses simple JSON configuration files which do not pollute application code.
- **Readable** - The validations are much more readable and comprehensible.

### Installation

`npm install quick-validate --save`

### Usage

- Create a directory named **validations** inside root of your project. This is not required but is recommended as a good practice.

- Create 2 files inside the **validations** directory - [apiValidations.json](#head_apiValidations) and [validationSchema.json](#head_validationSchema)

_apiValidations.json_ should specify validations for each endpoint. _validationSchema.json_ should specify type and other constraints about each attribute to be validated.

#### <a name="head_apiValidations"></a>apivalidations.json

```json
{
  "POST": {
    "/product": {
      "body": {
        "required": ["title", "img_url", "price", "availability_status"],
        "optional": ["description"]
      }
    }
  },
  "PUT": {
    "/product/:product_id": {
      "body": {
        "optional": [
          "title",
          "img_url",
          "price",
          "availability_status",
          "description"
        ]
      }
    }
  },
  "GET": {
    "/products": {
      "query": {
        "required": ["q"]
      }
    }
  },
  "DELETE": {
    "/product/:product_id": {
      "headers": {
        "required": ["admin_token"]
      }
    }
  }
}
```

As shown in above example, the configuration object structure should be

```json
{
  "httpMethod": {
    "endpoint_path1": {
      "required": ["attr1", "attr2"],
      "optional": ["attr3"]
    },
    "endpoint_path2": {
      "required": ["attr1", "attr2"],
      "optional": ["attr3"]
    }
  }
}
```

#### <a name="head_validationSchema"></a>validationSchema.json

```json
{
  "title": {
    "type": "String"
  },
  "img_url": {
    "type": "String"
  },
  "price": {
    "type": "Number"
  },
  "availability_status": {
    "type": "regex",
    "regex": "^(IN_STOCK|OUT_OF_STOCK)$"
  },
  "description": {
    "type": "String"
  },
  "q": {
    "type": "String",
    "minlength": 3,
    "maxlength": "50"
  },
  "admin_token": {
    "type": "String",
    "length": 32
  }
}
```

- Import and use _quick-validate_ in your **app.js**

Using ES6 (Recommended)

```js
import * as quickValidate from "quick-validate";
import apiValidations from "./validations/apiValidations.json";
import validationSchema from "./validations/validationSchema.json";
import express from "express";

const app = express();
quickValidate.enableValidations(app, apiValidations, validationSchema, true);
```

Good ol' way

```js
var quickValidate = require("quick-validate");
var apiValidations = require("./validations/apiValidations.json");
var validationSchema = require("./validations/validationSchema.json");
var express = require("express");

var app = express();
quickValidate.enableValidations(app, apiValidations, validationSchema, true);
```

- Intercept validation errors with middleware

```js
app.use(function (err, req, res, next) {
  res.json({
    ok: false,
    error: {
      code: err.code,
      reason: err.message,
    },
  });
});
```

#### Schema Properties

Click on property name to see example

| name                             | purpose                                     |
| -------------------------------- | :------------------------------------------ |
| [type](#head_supported_types)    | datatype of attribute                       |
| [length](#head_length)           | length of 'String' type attribute           |
| [minlength](#head_minmax_length) | min length of 'String' type attribute       |
| [maxlength](#head_minmax_length) | max length of 'String' type attribute       |
| [regex](#head_regex)             | specifies a pattern to match with           |
| [enumVals](#head_enum)           | specifies a set of enums to match with      |
| missing_err_code                 | error code to return if missing             |
| invalid_err_code                 | error code to return if datatype is invalid |

#### <a name="head_supported_types"></a>Supported 'type'(s)

| type     | purpose                                    |
| -------- | :----------------------------------------- |
| String   | Any string                                 |
| Number   | int, float or any string representing same |
| boolean  | boolean                                    |
| Array    | Any array                                  |
| Object   | Any Object                                 |
| email    | valid email                                |
| password | matches strict password policy             |

_regex_ and _enum_ fields doesn't need to specify _type_

##### Examples

<a name="head_length"></a>length

```json
{
  "otp": {
    "type": "String",
    "length": 4
  }
}
```

<a name="head_minmax_length"></a>minlength maxlength

```json
{
  "username": {
    "type": "String",
    "minlength": 5,
    "maxlength": 15
  }
}
```

<a name="head_regex"></a>regex

```json
{
  "ip": {
    "regex": "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
  }
}
```

<a name="head_enum"></a>enumVals

```json
{
  "availability_status": {
    "enumVals": ["IN_STOCK", "OUT_OF_STOCK"]
  }
}
```

#### Putting it all together

<u>validationSchema.json</u>

```json
{
  "username": {
    "type": "String",
    "minlength": 5,
    "maxlength": 15
  },
  "password": {
    "type": "password"
  },
  "email": {
    "type": "email"
  },
  "gender": {
    "enumVals": ["M", "F", "T"]
  },
  "age": {
    "type": "Number"
  },
  "is_married": {
    "type": "boolean"
  },
  "name": {
    "type": "String",
    "minlength": 5,
    "maxlength": 40
  },
  "x-forwarded-for": {
    "regex": "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
  }
}
```

<u>apivalidations.json</u>

```json
{
  "POST": {
    "/user/signup": {
      "body": {
        "required": [
          "username",
          "password",
          "email",
          "gender",
          "age",
          "is_married",
          "name"
        ]
      },
      "headers": {
        "required": ["x-forwarded-for"]
      }
    },
    "/user/login": {
      "body": {
        "required": ["username", "password"]
      }
    }
  }
}
```
