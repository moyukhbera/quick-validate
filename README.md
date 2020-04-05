# quick-validate 
###### Quick configurable API validations for Express.js

[![Travis Build](https://api.travis-ci.org/moyukhbera/quick-validate.svg)](https://travis-ci.org/github/moyukhbera/quick-validate) [![Coverage Status](https://coveralls.io/repos/github/moyukhbera/quick-validate/badge.svg?branch=master)](https://coveralls.io/github/moyukhbera/quick-validate?branch=master) [![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)

### Features

* **Simple** - Provides a simple and quick way to configure API validations
* **Clean** - Unlike other libraries, _quick-validate_ does not require you to write a lot of code for adding simple validations. It uses simple JSON configuration files which do not pollute application code. 
* **Readable** - The validations are much more readable and comprehensible. 

### Installation
`
npm install quick-validate --save
`

### Usage

1. Create a directory named **validations** inside root of your project. This is not required but is recommended as a good practice.

2. Create 2 files inside the **validations** directory - [apiValidations.json](#head_apiValidations) and [validationSchema.json](#head_validationSchema)

_apiValidations.json_ should specify validations for each endpoint. _validationSchema.json_ should specify type and other constraints about each attribute to be validated.

#### <a name="head_apiValidations"></a>apivalidations.json

```json
{
	"POST": {
		"/product": {
			"body": {
				"required": [
					"title",
					"img_url",
					"price",
					"availability_status"
				],
				"optional": [
					"description"
				]
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
				"required": [
					"q"
				]
			}
		}
	},
	"DELETE": {
		"/product/:product_id": {
			"headers": {
				"required": [
					"admin_token"
				]
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

3. Import and use _quick-validate_ in your **app.js**

```js
import * as quickValidate from 'quick-validate';
import apiValidations from './validations/apiValidations.json';
import validationSchema from './validations/validationSchema.json';
import express from 'express';

const app = express();
quickValidate.enableValidations(app, apiValidations, validationSchema, true);
```