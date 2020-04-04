import * as index from './index';

test('getValue gets field value without "."', () => {
    expect(index.getValue({ username: 'test' }, 'username')).toBe('test');
});

test('getValue gets field value with "."', () => {
    expect(index.getValue({ user: { username: 'test' } }, 'user.username')).toBe('test');
});

test('getValue returns undefined for non-existent field', () => {
    expect(index.getValue({ user: { username: 'test' } }, 'product')).toBe(undefined);
});

test('getValidationDefForFieldList adds required:true when required', () => {
    expect(index.getValidationDefForFieldList({}, ["username", "password"], {
        "password": {
            "type": "string",
            "minlength": 5,
            "maxlength": 15
        },
        "username": {
            "type": "email"
        }
    }, true)).toStrictEqual({
        "password": {
            "type": "string",
            "minlength": 5,
            "maxlength": 15,
            required: true
        },
        "username": {
            "type": "email",
            required: true
        }
    });
});

test('getValidationDefForFieldList throws Error if validation schema does not contain validation field', () => {
    expect(() => {
        index.getValidationDefForFieldList({}, ["username", "password"], {
            "username": {
                "type": "email"
            }
        }, true)
    }).toThrow(Error);
});

test('getSchemaForValidatedFields returns schema with correctly set required field', () => {
    expect(index.getSchemaForValidatedFields({ required: ["username", "password"], optional: ["location"] }, {
        "password": {
            "type": "string",
            "minlength": 5,
            "maxlength": 15
        },
        "username": {
            "type": "email"
        },
        "location": {
            type: "String"
        }
    })).toStrictEqual({
        "password": {
            "type": "string",
            "minlength": 5,
            "maxlength": 15,
            required: true
        },
        "username": {
            "type": "email",
            required: true
        },
        location: {
            type: "String",
            required: false
        }
    });
});

test('getSchemaForValidatedFields returns empty object if it does not find any required or optional field', () => {
    expect(index.getSchemaForValidatedFields({}, {
        "password": {
            "type": "string",
            "minlength": 5,
            "maxlength": 15
        },
        "username": {
            "type": "email"
        },
        "location": {
            type: "String"
        }
    })).toStrictEqual({});
});

test('setParamRouteValidations replaces param variable with regex', () => {
    expect(index.setParamRouteValidations({
        GET: {
            "/product/:product_id": {

            }
        }
    })).toStrictEqual({
        GET: {
            "/product/[a-zA-Z0-9-]+": {

            }
        },
        DELETE: {},
        POST: {},
        PUT: {}
    });
});

test('setParamRouteValidations returns empty objects for each HTTP method if there is no param variable', () => {
    index.resetParamAuthRoutes();
    expect(index.setParamRouteValidations({
        GET: {
            "/products": {
            }
        }
    })).toStrictEqual({
        GET: {},
        DELETE: {},
        POST: {},
        PUT: {}
    });
});

test('getValidationForParamRoute returns validations for route with path param', () => {
    index.resetParamAuthRoutes();
    index.setParamRouteValidations({
        POST: {
            "/someurl/:some_id": {},
            "/product/:product_id": {
                body: {
                    required: [
                        "name",
                        "image_url"
                    ]
                }
            }
        }
    });
    expect(index.getValidationForParamRoute("POST", "/product/1234")).toStrictEqual({
        body: {
            required: [
                "name",
                "image_url"
            ]
        }
    });
});

test('getValidationForParamRoute returns null if path is not matched', () => {
    index.resetParamAuthRoutes();
    index.setParamRouteValidations({
        POST: {
            "/someurl/:some_id": {},
            "/product/:product_id": {
                body: {
                    required: [
                        "name",
                        "image_url"
                    ]
                }
            }
        }
    });
    expect(index.getValidationForParamRoute("GET", "/product/1234")).toBe(null);
});

test('getValidationForParamRoute returns null if http method is not in validation config', () => {
    index.resetParamAuthRoutes();
    index.setParamRouteValidations({
        POST: {
            "/someurl/:some_id": {},
            "/product/:product_id": {
                body: {
                    required: [
                        "name",
                        "image_url"
                    ]
                }
            }
        }
    });
    expect(index.getValidationForParamRoute("HEAD", "/product/1234")).toBe(null);
});



test('interceptor returns func which does not throw error if apiValidations and validationSchema are fine', () => {
    let apiValidations = {
        POST: {
            "/user/login": {
                body: {
                    required: [
                        "username",
                        "password"
                    ]
                }
            }
        }
    };
    let validationSchema = {
        username: {
            type: 'String',
            minlength: 5,
            maxlength: 10
        },
        password: {
            type: 'String',
            minlength: 8,
            maxlength: 15
        }
    }

    let req = {
        method: 'POST',
        originalUrl: '/user/login'
    }
    index.interceptor(apiValidations, false, validationSchema)(req, null, (err) => {
        expect(err).not.toBe(null);
    });
});

test('interceptor returns func which does not throw error if apiValidations does not have requested HTTP method', () => {
    let apiValidations = {
        GET: {
            "/myfeed": {
                query: {
                    optional: [
                        "since_millis"
                    ]
                }
            }
        }
    };
    let validationSchema = {
        since_millis: {
            type: 'Number'
        }
    }

    let req = {
        method: 'POST',
        originalUrl: '/user/login'
    }
    index.interceptor(apiValidations, false, validationSchema)(req, null, (err) => {
        expect(err).toBe(undefined);
    });
});

test('interceptor returns func which does not throw error if apiValidations does not have requested HTTP method', () => {
    let apiValidations = {
        POST: {
            "/user/login": {
                body: {
                    required: [
                        "username",
                        "password"
                    ]
                }
            }
        }
    };
    let validationSchema = {
        username: {
            type: 'String',
            minlength: 5,
            maxlength: 10
        },
        password: {
            type: 'String',
            minlength: 8,
            maxlength: 15
        }
    }

    let req = {
        method: 'POST',
        originalUrl: '/user/changepassword'
    }
    index.interceptor(apiValidations, false, validationSchema)(req, null, (err) => {
        expect(err).toBe(undefined);
    });
});

test('interceptor returns func which does not throw error if apiValidations does not have requested HTTP method 3', () => {
    index.resetParamAuthRoutes();
    let apiValidations = {
        POST: {
            "/product/:product_id": {
                body: {
                    required: [
                        "product_name",
                        "desc"
                    ]
                }
            }
        }
    };
    let validationSchema = {
        product_name: {
            type: 'String',
            minlength: 5,
            maxlength: 120
        },
        desc: {
            type: 'String',
            minlength: 8,
            maxlength: 300
        }
    }

    let req = {
        method: 'POST',
        originalUrl: '/product/1234',
        body: {
            product_name: "Some fictious product",
            desc: "Some desc about product"
        }
    }
    index.interceptor(apiValidations, false, validationSchema)(req, null, (err) => {
        expect(err).toBe(undefined);
    });
});

test('interceptor returns func to remove extraAttrs when removeExtraAttrs arguments is true', () => {
    index.resetParamAuthRoutes();
    let apiValidations = {
        POST: {
            "/product/:product_id": {
                body: {
                    required: [
                        "product_name",
                        "price"
                    ],
                    optional: [
                        "desc"
                    ]
                }
            }
        }
    };
    index.setParamRouteValidations(apiValidations);
    let validationSchema = {
        product_name: {
            type: 'String',
            minlength: 5,
            maxlength: 120
        },
        desc: {
            type: 'String',
            minlength: 8,
            maxlength: 300
        },
        price: {
            type: 'Number'
        }
    }

    let req = {
        method: 'POST',
        originalUrl: '/product/1234',
        body: {
            product_name: "Some fictious product",
            desc: "",
            price: 999.99,
            some_extra_attr: "this should be removed"

        }
    }
    index.interceptor(apiValidations, true, validationSchema)(req, null, (err) => {
        expect(req.body.some_extra_attr).toBe(undefined);
    });
});

test('interceptor returns func to remove extraAttrs when removeExtraAttrs arguments is true', () => {
    index.resetParamAuthRoutes();
    let apiValidations = {
        POST: {
            "/product/:product_id": {
                body: {
                    required: [
                        "product_name",
                        "price"
                    ],
                    optional: [
                        "desc"
                    ]
                }
            }
        }
    };
    index.setParamRouteValidations(apiValidations);
    let validationSchema = {
        product_name: {
            type: 'String',
            minlength: 5,
            maxlength: 120
        },
        desc: {
            type: 'String',
            minlength: 8,
            maxlength: 300
        },
        price: {
            type: 'Number'
        }
    }

    let req = {
        method: 'POST',
        originalUrl: '/product/1234',
        body: {
            price: 999.99,
            some_extra_attr: "this should be removed"

        }
    }
    index.interceptor(apiValidations, false, validationSchema)(req, null, (err) => {
        expect(err).not.toBe(undefined);
    });
});

test('interceptor returns func to remove extraAttrs when removeExtraAttrs arguments is true', () => {
    index.resetParamAuthRoutes();
    let apiValidations = {
        GET: {
            "/products": {
                query: {
                    required: [
                        "page"
                    ]
                }
            }
        }
    };
    index.setParamRouteValidations(apiValidations);
    let validationSchema = {
        page: {
            type: 'Number'
        }
    }

    let req = {
        method: 'POST',
        originalUrl: '/product/1234',
        query: {
            page: "1"

        }
    }
    index.interceptor(apiValidations, false, validationSchema)(req, null, (err) => {
        expect(err).toBe(undefined);
    });
});

test('interceptor returns func to remove extraAttrs when removeExtraAttrs arguments is true', () => {
    index.resetParamAuthRoutes();
    let apiValidations = {
        GET: {
            "/products": {
                query: {
                    required: [
                        "page"
                    ]
                }
            }
        }
    };
    index.setParamRouteValidations(apiValidations);
    let validationSchema = {
        page: {
            type: 'Number'
        }
    }

    let req = {
        method: 'GET',
        originalUrl: '/products',
        query: {
            size: "10"

        }
    }
    index.interceptor(apiValidations, false, validationSchema)(req, null, (err) => {
        expect(err).not.toBe(undefined);
    });
});

test('interceptor returns func to remove extraAttrs when removeExtraAttrs arguments is true', () => {
    index.resetParamAuthRoutes();
    let apiValidations = {
        GET: {
            "/cart": {
                headers: {
                    required: [
                        "sessiontoken"
                    ]
                }
            }
        }
    };
    index.setParamRouteValidations(apiValidations);
    let validationSchema = {
        sessiontoken: {
            type: 'String'
        }
    }

    let req = {
        method: 'GET',
        originalUrl: '/cart'
    }
    index.interceptor(apiValidations, false, validationSchema)(req, null, (err) => {
        expect(err).not.toBe(undefined);
    });
});

test('interceptor returns func to remove extraAttrs when removeExtraAttrs arguments is true', () => {
    index.enableValidations({ use: () => { } }, {}, {}, false);
});