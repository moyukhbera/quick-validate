
export const validMaxLength = (val, maxlength) => {
    if (!val)
        throw new Error('maxlength needs a value to validate');
    if (!(typeof val === 'string') && !(Object.prototype.toString.call(val) === '[object Array]')) {
        throw new Error('maxlength validation works on String or Array');
    }

    if (val.length > maxlength)
        return false;
    return true;
}

export const validMinLength = (val, minlength) => {
    if (!val)
        throw new Error('minlength needs a value to validate');
    if (!(typeof val === 'string') && !(Object.prototype.toString.call(val) === '[object Array]')) {
        throw new Error('minlength validation works on String or Array');
    }
    if (val.length < minlength)
        return false;
    return true;
}

export const validLength = (val, length) => {
    if (!val)
        throw new Error('length needs a value to validate');
    if (!(typeof val === 'string') && !(Object.prototype.toString.call(val) === '[object Array]')) {
        throw new Error('length validation works on String or Array');
    }
    if (val.length != length)
        return false;
    return true;
}

export const validEnum = (val, enumVals) => {
    if (!val)
        throw new Error('enum needs values to validate');
    if (enumVals.indexOf(val) === -1) {
        return false;
    }
    return true;
}

export const validRegex = (val, regex) => {
    return new RegExp(regex).test(val);
}

export const isNumber = (n) => {
    return Number(n) === n;
}

export const isString = (val) => {
    return typeof val === 'string';
}

export const isBoolean = (val) => {
    return typeof val === 'boolean';
}

export const validEmail = (email) => {
    var emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
}

export const isStrongPassword = (password) => {
    var strongPsswdRegex = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,15}$/;
    return strongPsswdRegex.test(password);
}

function throwErrorWithCode(errMsg, code = 1001) {
    var err = new Error(errMsg);
    err.code = code;
    err.status = 400;
    throw err;
}

var PASSWORD_CRITERIA_STR = 'must be 8-15 characters, should contain atleast 1 special character, 1 digit, 1 lower case and 1 upper case character';

/**
 * 
 * @param {*} obj 
 * example: 
 {
     "username":"someusername@somedomain.com",
     "phone_no":"9831012345"
 }
 * @param {*} validationConfig  
 * example:
 {
     "username": {
        "type": "email",
        "missing_err_code": 1012,
        "invalid_err_code": 1005
    },
    "phone_no": {
        "type": "regex",
        "regex": "^\\d{10}$",
        "missing_err_code": 1012,
        "invalid_err_code": 2001
    }
}
 */
export const validate = (obj, validationConfig) => {
    if (!obj)
        obj = {};

    for (let fieldName in validationConfig) {
        var fieldValidations = validationConfig[fieldName];
        let errCode = fieldValidations.invalid_err_code;
        if (!fieldValidations.type) {
            throw new Error("Validation field 'type' required for field '" + fieldName + "'");
        }

        if (fieldValidations.required && obj[fieldName] !== false && !obj[fieldName]) {
            throwErrorWithCode(fieldName + ' is required', (fieldValidations.missing_err_code || 1111));
        }

        if (obj[fieldName] !== false && obj[fieldName] !== '' && !obj[fieldName])
            return;

        for (let key in fieldValidations) {
            if (key === 'type') {
                if (fieldValidations[key] === 'email' && !validEmail(obj[fieldName])) {
                    throwErrorWithCode(fieldName + ' should be a valid email', errCode);
                } else if (fieldValidations[key] === 'password' && (!isStrongPassword(obj[fieldName]))) {
                    throwErrorWithCode(fieldName + ' ' + PASSWORD_CRITERIA_STR, errCode);
                } else if (fieldValidations[key] === 'String' && !isString(obj[fieldName])) {
                    throwErrorWithCode(fieldName + ' should be a String', errCode);
                } else if (fieldValidations[key] === 'Number' && !isNumber(obj[fieldName])) {
                    throwErrorWithCode(fieldName + ' should be a Number', errCode);
                } else if (fieldValidations[key] === 'Object' && !(obj[fieldName] instanceof Object)) {
                    throwErrorWithCode(fieldName + ' should be an Object', errCode);
                } else if (fieldValidations[key] === 'Array' && !(obj[fieldName] instanceof Array)) {
                    throwErrorWithCode(fieldName + ' should be an Array', errCode);
                } else if (fieldValidations[key] === 'boolean' && !isBoolean(obj[fieldName])) {
                    throwErrorWithCode(fieldName + ' should be a Boolean', errCode);
                }
            } else if (key === 'length' && !validLength(obj[fieldName], fieldValidations[key])) {
                throwErrorWithCode(fieldName + ' should be of length ' + fieldValidations[key], errCode);
            } else if (key === 'maxlength' && !validMaxLength(obj[fieldName], fieldValidations[key])) {
                throwErrorWithCode(fieldName + ' should not exceed length of ' + fieldValidations[key], errCode);
            } else if (key === 'minlength' && !validMinLength(obj[fieldName], fieldValidations[key])) {
                throwErrorWithCode(fieldName + ' should be minimum length of ' + fieldValidations[key], errCode);
            } else if (key === 'enumVals' && !validEnum(obj[fieldName], fieldValidations[key])) {
                throwErrorWithCode(fieldName + ' should be any of ' + JSON.stringify(fieldValidations[key], errCode));
            } else if (key === 'regex' && !validRegex(obj[fieldName], fieldValidations[key])) {
                throwErrorWithCode(fieldName + ' value unexpected', errCode);
            } else {
                continue;
            }
        }
    }
}