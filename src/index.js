import * as quickValidate from "./quickValidate";
import * as Logger from "./logging/logger";

export const getValue = (obj, key) => {
    let keys = key.split(".");
    if (obj[keys[0]]) {
        let val = obj[keys[0]];

        if (!val || keys.length < 2) {
            return val;
        }
        return val[keys[1]];
    }
}

export const getValidationDefForFieldList = (validationDefObj, fieldNameList, validationSchema, isRequired) => {
    let obj = validationDefObj;
    for (let i = 0; i < fieldNameList.length; i++) {
        let fieldName = fieldNameList[i];
        obj[fieldName] = getValue(validationSchema, fieldName);
        if (!obj[fieldName]) {
            throw new Error(fieldName + " not found in validation schema");
        }
        obj[fieldName]["required"] = isRequired;
    }
    return obj;
}

export const getSchemaForValidatedFields = (fieldConfig, validationSchema) => {
    let obj = {};

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
    for (const httpMethod in routesJSON) {
        for (const url in routesJSON[httpMethod]) {
            if (url.indexOf(":") > -1) {
                paramAuthRoutes[httpMethod][url.replace(/:[a-zA-Z0-9-_]+/g, "[a-zA-Z0-9-_]+")] = routesJSON[httpMethod][url];
            }
        }
    }
    return paramAuthRoutes;
};

export const getValidationForParamRoute = (httpMethod, originalUrl) => {
    if (paramAuthRoutes[httpMethod]) {
        for (const url in paramAuthRoutes[httpMethod]) {
            let pattern = new RegExp(url);
            let isMatch = pattern.test(originalUrl);

            if (isMatch) {
                return paramAuthRoutes[httpMethod][url];
            }
        }
    }
    return null;
}

export const interceptor = (apiValidations, removeExtraAttrs, validationSchema) => {
    return function (req, res, next) {
        let httpMethod = req.method;
        let url = req.originalUrl.toLowerCase().split("\?")[0];

        if (apiValidations) {
            let httpMethodValidations = apiValidations[httpMethod];
            if (!httpMethodValidations) {
                return next();
            }
            let routeValidations = {};
            let paramRouteValidations = getValidationForParamRoute(httpMethod, url);
            if (paramRouteValidations) {
                routeValidations = paramRouteValidations;
            }
            else {
                routeValidations = httpMethodValidations[url];
            }

            if (!routeValidations) {
                return next();
            }

            //Stripping additional attributes
            if (httpMethod === "POST" || httpMethod === "PUT") {
                if (routeValidations.body && removeExtraAttrs) {
                    let requiredAttrs = (routeValidations.body.required) ? routeValidations.body.required : [];
                    let optionalAttrs = (routeValidations.body.optional) ? routeValidations.body.optional : [];
                    let allAttrs = requiredAttrs.concat(optionalAttrs);
                    let bodyTmp = {};
                    for (let i = 0; i < allAttrs.length; i++) {
                        bodyTmp[allAttrs[i]] = req.body[allAttrs[i]];
                    }
                    req.body = bodyTmp;
                    for (let i = 0; i < optionalAttrs.length; i++) {
                        let attributeName = optionalAttrs[i];
                        if (req.body[attributeName] === "") {
                            delete req.body[attributeName];
                        }
                    }
                }
            }
            Logger.info("routeValidations: " + JSON.stringify(routeValidations));
            try {
                if (routeValidations.body) {
                    validateReqPart("body", req, routeValidations, validationSchema, next);
                }

                if (routeValidations.query) {
                    validateReqPart("query", req, routeValidations, validationSchema, next);
                }

                if (routeValidations.headers) {
                    validateReqPart("headers", req, routeValidations, validationSchema, next);
                }
            } catch (e) {
                return next(e);
            }

        }
        next();
    };
};

export const enableValidations = (app, apiValidations, validationSchema, removeExtraAttrs) => {
    setParamRouteValidations(apiValidations);
    app.use(interceptor(apiValidations, removeExtraAttrs, validationSchema));
};

export const validateReqPart = (partName, req, routeValidations, validationSchema, next) => {
    let fieldValidationCfg = getSchemaForValidatedFields(routeValidations[partName], validationSchema);
    quickValidate.validate(req[partName], fieldValidationCfg, partName);
};
