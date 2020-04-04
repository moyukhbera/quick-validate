import * as quickValidate from './quickValidate';

export const getValue = (obj, key) => {
    var keys = key.split('.');
    if (obj[keys[0]]) {
        var val = obj[keys[0]];

        if (!val || keys.length < 2)
            return val;
        return val[keys[1]];
    }
}

export const getValidationDefForFieldList = (validationDefObj, fieldNameList, validationSchema, isRequired) => {
    console.log(JSON.stringify(validationSchema));
    var obj = validationDefObj;
    for (var i = 0; i < fieldNameList.length; i++) {
        var fieldName = fieldNameList[i];
        obj[fieldName] = getValue(validationSchema, fieldName);
        console.log('fieldName ->', fieldName);
        if (!obj[fieldName]) {
            throw new Error(fieldName + ' not found in validation schema');
        }
        obj[fieldName]['required'] = isRequired;
    }
    return obj;
}

export const getSchemaForValidatedFields = (fieldConfig, validationSchema) => {
    var obj = {};
    console.log('fieldConfig: ' + JSON.stringify(fieldConfig));

    if (fieldConfig.required) {
        getValidationDefForFieldList(obj, fieldConfig.required, validationSchema, true);
    }

    if (fieldConfig.optional) {
        getValidationDefForFieldList(obj, fieldConfig.optional, validationSchema, false);
    }
    return obj;
}

let paramAuthRoutes = {
    POST: {},
    GET: {},
    PUT: {},
    DELETE: {}
};

export const resetParamAuthRoutes = () => {
    paramAuthRoutes = {
        POST: {},
        GET: {},
        PUT: {},
        DELETE: {}
    };
}

//Method to set the route-role mapping JSON object
export const setParamRouteValidations = (routesJSON) => {
    for (var httpMethod in routesJSON) {
        for (var url in routesJSON[httpMethod]) {
            if (url.indexOf(':') > -1) {
                paramAuthRoutes[httpMethod][url.replace(/:[a-zA-Z0-9-_]+/g, '[a-zA-Z0-9-]+')] = routesJSON[httpMethod][url];
            }
        }
    }
    console.log('setParamRouteValidations:', JSON.stringify(paramAuthRoutes));
    return paramAuthRoutes;
};

export const getValidationForParamRoute = (httpMethod, originalUrl) => {
    if (paramAuthRoutes[httpMethod]) {
        for (var url in paramAuthRoutes[httpMethod]) {
            var pattern = new RegExp(url);
            var isMatch = pattern.test(originalUrl);

            if (isMatch) {
                return paramAuthRoutes[httpMethod][url];
            }
        }
    }
    return null;
}

export const enableValidations = (app, apiValidations, validationSchema, removeExtraAttrs) => {
    setParamRouteValidations(apiValidations);
    app.use(interceptor(apiValidations, removeExtraAttrs, validationSchema));
}

export const interceptor = (apiValidations, removeExtraAttrs, validationSchema) => {
    return function (req, res, next) {
        var httpMethod = req.method;
        var url = req.originalUrl.toLowerCase().split('\?')[0];
        var lastSlashIndex = url.lastIndexOf('\/');
        var baseURL = url.substring(0, lastSlashIndex);
        console.log('Validating...');
        if (apiValidations) {
            var httpMethodValidations = apiValidations[httpMethod];
            if (!httpMethodValidations)
                return next();
            var routeValidations = {};
            var paramRouteValidations = getValidationForParamRoute(httpMethod, url);
            if (paramRouteValidations)
                routeValidations = paramRouteValidations;
            else
                routeValidations = httpMethodValidations[url];
            console.log('routeValidations: ' + JSON.stringify(routeValidations));
            if (!routeValidations)
                return next();
            console.log('Stripping additional attributes...');
            //Stripping additional attributes
            if (httpMethod === 'POST' || httpMethod === 'PUT') {
                console.log(JSON.stringify(routeValidations.body), removeExtraAttrs);
                if (routeValidations.body && removeExtraAttrs) {
                    var requiredAttrs = (routeValidations.body.required) ? routeValidations.body.required : [];
                    var optionalAttrs = (routeValidations.body.optional) ? routeValidations.body.optional : [];
                    var allAttrs = requiredAttrs.concat(optionalAttrs);
                    var bodyTmp = {};
                    for (var i = 0; i < allAttrs.length; i++) {
                        bodyTmp[allAttrs[i]] = req.body[allAttrs[i]];
                    }
                    req.body = bodyTmp;
                    for (var i = 0; i < optionalAttrs.length; i++) {
                        var attributeName = optionalAttrs[i];
                        if (req.body[attributeName] === '') {
                            delete req.body[attributeName];
                        }
                    }
                }
            }
            console.log('routeValidations: ' + JSON.stringify(routeValidations));
            if (routeValidations.body) {
                var fieldValidationCfg = getSchemaForValidatedFields(routeValidations.body, validationSchema);
                try {
                    console.log(JSON.stringify(fieldValidationCfg));
                    quickValidate.validate(req.body, fieldValidationCfg);
                }
                catch (err) {
                    console.log('Body Error: ' + err.stack + ' ' + err.code);
                    return next(err);
                }
            }
            if (routeValidations.query) {
                var fieldValidationCfg = getSchemaForValidatedFields(routeValidations.query, validationSchema);
                console.log('fieldValidationCfg ->', JSON.stringify(fieldValidationCfg));
                try {
                    console.log('fieldValidations: ' + JSON.stringify(fieldValidationCfg));
                    quickValidate.validate(req.query, fieldValidationCfg);
                }
                catch (err) {
                    console.log('Query Error: ' + err.stack + ' ' + err.code);
                    return next(err);
                }
            }
            if (routeValidations.headers) {
                var fieldValidationCfg = getSchemaForValidatedFields(routeValidations.headers, validationSchema);
                console.log('fieldValidationCfg ->', JSON.stringify(fieldValidationCfg));
                try {
                    console.log('fieldValidations: ' + JSON.stringify(fieldValidationCfg));
                    quickValidate.validate(req.headers, fieldValidationCfg);
                }
                catch (err) {
                    console.log('Query Error: ' + err.stack + ' ' + err.code);
                    return next(err);
                }
            }
        }
        req.body = (req.body) ? JSON.parse(JSON.stringify(req.body)) : req.body;
        next();
    };
}
