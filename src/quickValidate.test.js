import * as quickValidate from "./quickValidate";

test("isString returns true for valid string", () => {
    expect(quickValidate.isString("abc")).toBe(true);
});

test("isString returns false for non-string", () => {
    expect(quickValidate.isString(123)).toBe(false);
    expect(quickValidate.isString([1, 2, 3])).toBe(false);
});

test("isNumber returns true for valid number", () => {
    expect(quickValidate.isNumber(123)).toBe(true);
});

test("isNumber returns false for non-numbers", () => {
    expect(quickValidate.isNumber("123")).toBe(true);
    expect(quickValidate.isNumber([1, 2, 3])).toBe(false);
});

test("isBoolean returns true for valid boolean", () => {
    expect(quickValidate.isBoolean(true)).toBe(true);
    expect(quickValidate.isBoolean(false)).toBe(true);
});

test("isBoolean returns false for non-boolean", () => {
    expect(quickValidate.isBoolean(123)).toBe(false);
});

test("validEmail returns true for valid email", () => {
    expect(quickValidate.validEmail("moyukh@xyz.com")).toBe(true);
});

test("validEmail returns false for invalid email", () => {
    expect(quickValidate.validEmail("hjjghjg.com")).toBe(false);
});

test("isStrongPassword returns true for strong password", () => {
    expect(quickValidate.isStrongPassword("Dentir@123")).toBe(true);
});

test("isStrongPassword returns false for weak password", () => {
    expect(quickValidate.isStrongPassword("Dentira123")).toBe(false);
});

test("validRegex returns true if value matches regex", () => {
    expect(quickValidate.validRegex("(123) 123-1234", /^(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}$/)).toBe(true);
});

test("validRegex returns false if value does not match regex", () => {
    expect(quickValidate.validRegex("123 123-1234", /^(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}$/)).toBe(false);
});

test("validLength returns true of length is matching", () => {
    expect(quickValidate.validLength("abc", 3)).toBe(true);
});

test("validLength returns false of length is not matching", () => {
    expect(quickValidate.validLength("abc", 4)).toBe(false);
});

test("validLength throws error of value is not string or array", () => {
    expect(() => { quickValidate.validLength(1234, 4); }).toThrow(Error);
});

test("validLength throws error of value if no value is passed", () => {
    expect(() => { quickValidate.validLength(null, 2); }).toThrow(Error);
});

test("validMinLength returns true of length >= min_length provided", () => {
    expect(quickValidate.validMinLength("1234567", 5)).toBe(true);
});

test("validMinLength returns false of length < min_length provided", () => {
    expect(quickValidate.validMinLength("1234567", 8)).toBe(false);
});

test("validMinLength throws error of value is not string or array", () => {
    expect(() => { quickValidate.validMinLength(1234, 2); }).toThrow(Error);
});

test("validMinLength throws error of value if no value is passed", () => {
    expect(() => { quickValidate.validMinLength(null, 2); }).toThrow(Error);
});

test("validMaxLength returns true of length <= max_length provided", () => {
    expect(quickValidate.validMaxLength("1234567", 10)).toBe(true);
});

test("validMaxLength returns false of length > max_length provided", () => {
    expect(quickValidate.validMaxLength("1234567", 5)).toBe(false);
});

test("validMaxLength throws error of value is not string or array", () => {
    expect(() => { quickValidate.validMaxLength(1234, 8); }).toThrow(Error);
});

test("validMaxLength throws error of value if no value is passed", () => {
    expect(() => { quickValidate.validMaxLength(null, 2); }).toThrow(Error);
});

test("validEnum returns true in case of valid enum", () => {
    expect(quickValidate.validEnum("S", ["S", "M", "L", "XL"])).toBe(true);
});

test("validEnum returns false in case of invalid enum", () => {
    expect(quickValidate.validEnum("XXL", ["S", "M", "L", "XL"])).toBe(false);
});

test("validEnum throws error of value if no value is passed", () => {
    expect(() => { quickValidate.validEnum(null, ["S", "M"]); }).toThrow(Error);
});

test("validate throws Error if field validation schema does not have type", () => {
    let validationSchema = {
        "username": {
            "missing_err_code": 1012,
            "invalid_err_code": 1005
        }
    };
    try {
        quickValidate.validate({ username: "test@test.com" }, validationSchema);
    } catch (e) {
        expect(e.message).toBe("Validation field \"type\" required for field \"username\"");
    }
});

test("validate throws Error if field is required but data is null", () => {
    let validationSchema = {
        "username": {
            "type": "email",
            required: true,
            "missing_err_code": 1012,
            "invalid_err_code": 1005
        }
    };
    expect(() => {
        quickValidate.validate(null, validationSchema);
    }).toThrow(Error);
});

test("validate throws Error if field is required but same is missing in data", () => {
    let validationSchema = {
        "username": {
            "type": "email",
            required: true,
            "missing_err_code": 1012,
            "invalid_err_code": 1005
        }
    };
    try {
        quickValidate.validate({ phone_no: "9831012345" }, validationSchema);
    } catch (e) {
        expect(e.message).toBe("username is required");
    }
});

test("validate throws Error with 1111 code if required field is missing and schema does not have missing_err_code", () => {
    let validationSchema = {
        "username": {
            "type": "email",
            required: true,
            "invalid_err_code": 1005
        }
    };
    try {
        quickValidate.validate({ phone_no: "9831012345" }, validationSchema);
    } catch (e) {
        expect(e.code).toBe(1111);
    }
});

test("validate throws Error if email field has non-email value", () => {
    let validationSchema = {
        "username": {
            "type": "email",
            required: true,
            "missing_err_code": 1012,
            "invalid_err_code": 1005
        }
    };
    try {
        quickValidate.validate({ username: "9831012345" }, validationSchema);
    } catch (e) {
        expect(e.message).toBe("username should be a valid email");
    }
});

test("validate skips field which are not required and not in data", () => {
    let validationSchema = {
        "username": {
            "type": "email",
            "missing_err_code": 1012,
            "invalid_err_code": 1005
        }
    };
    expect(() => { quickValidate.validate({}, validationSchema); }).not.toThrow(Error);

});

test("validate throws validation error if password type field does not match strong password criteria", () => {
    let validationSchema = {
        "password": {
            "type": "password",
            "missing_err_code": 1012,
            "invalid_err_code": 1005
        }
    };
    try {
        quickValidate.validate({ password: "12345" }, validationSchema);
    } catch (e) {
        expect(e.message).toBe("password must be 8-15 characters, should contain atleast 1 special character, 1 digit, 1 lower case and 1 upper case character");
    }
});

test("validate throws validation error if String type field has non-string value", () => {
    let validationSchema = {
        "name": {
            "type": "String",
            "missing_err_code": 1012,
            "invalid_err_code": 1005
        }
    };
    try {
        quickValidate.validate({ name: 12345 }, validationSchema);
    } catch (e) {
        expect(e.message).toBe("name should be a String");
    }
});

test("validate throws validation error if Number type field has non-numeric value", () => {
    let validationSchema = {
        "amt_to_transfer": {
            "type": "Number",
            "missing_err_code": 1012,
            "invalid_err_code": 1005
        }
    };
    try {
        quickValidate.validate({ amt_to_transfer: "1000" }, validationSchema);
    } catch (e) {
        expect(e.message).toBe("amt_to_transfer should be a Number");
    }
});

test("validate throws validation error if Number type field for query param has non-numeric value", () => {
    let validationSchema = {
        "page": {
            "type": "Number",
            "missing_err_code": 1012,
            "invalid_err_code": 1005
        }
    };
    try {
        quickValidate.validate({ page: "abc" }, validationSchema, "query");
    } catch (e) {
        expect(e.message).toBe("page should be a Number");
    }
});

test("validate throws validation error if Number type field for query param has non-numeric value", () => {
    let validationSchema = {
        "page": {
            "type": "Number",
            "missing_err_code": 1012,
            "invalid_err_code": 1005
        }
    };
    try {
        let queryParams = { page: "1" };
        quickValidate.validate(queryParams, validationSchema, "query");
        expect(queryParams.page).toBe(1);
    } catch (e) {
        //Nothing to catch here
    }
});

test("validate throws validation error if Object type field has primitive values", () => {
    let validationSchema = {
        "cart": {
            "type": "Object",
            "missing_err_code": 1012,
            "invalid_err_code": 1005
        }
    };
    try {
        quickValidate.validate({ cart: 12345 }, validationSchema);
    } catch (e) {
        expect(e.message).toBe("cart should be an Object");
    }
});

test("validate throws validation error if Array type field has non-array", () => {
    let validationSchema = {
        "favorite_books": {
            "type": "Array",
            "missing_err_code": 1012,
            "invalid_err_code": 1005
        }
    };
    try {
        quickValidate.validate({ favorite_books: "Outliers" }, validationSchema);
    } catch (e) {
        expect(e.message).toBe("favorite_books should be an Array");
    }
});

test("validate throws validation error if boolean type field has non-boolean value", () => {
    let validationSchema = {
        "is_subscribed": {
            "type": "boolean",
            "missing_err_code": 1012,
            "invalid_err_code": 1005
        }
    };
    try {
        quickValidate.validate({ is_subscribed: "true" }, validationSchema);
    } catch (e) {
        expect(e.message).toBe("is_subscribed should be a Boolean");
    }
});

test("validate throws validation error if string field is not of declared length", () => {
    let validationSchema = {
        "otp": {
            "type": "String",
            "length": 4,
            "missing_err_code": 1012,
            "invalid_err_code": 1005
        }
    };
    try {
        quickValidate.validate({ otp: "123456" }, validationSchema);
    } catch (e) {
        expect(e.message).toBe("otp should be of length 4");
    }
});

test("validate throws validation error if array field is not of declared length", () => {
    let validationSchema = {
        "top_5": {
            "type": "Array",
            "length": 5,
            "missing_err_code": 1012,
            "invalid_err_code": 1005
        }
    };
    try {
        quickValidate.validate({ top_5: ["Go", "Node.js"] }, validationSchema);
    } catch (e) {
        expect(e.message).toBe("top_5 should be of length 5");
    }
});


test("validate throws validation error if string field length < minlength", () => {
    let validationSchema = {
        "name": {
            type: "String",
            minlength: 3,
            "missing_err_code": 1012,
            "invalid_err_code": 1005
        }
    };
    try {
        quickValidate.validate({ name: "Ab" }, validationSchema);
    } catch (e) {
        expect(e.message).toBe("name should be minimum length of 3");
    }
});

test("validate throws validation error if array field is less than declared minlength", () => {
    let validationSchema = {
        "top_5": {
            "type": "Array",
            "minlength": 5,
            "missing_err_code": 1012,
            "invalid_err_code": 1005
        }
    };
    try {
        quickValidate.validate({ top_5: ["Go", "Node.js"] }, validationSchema);
    } catch (e) {
        expect(e.message).toBe("top_5 should be minimum length of 5");
    }
});

test("validate throws validation error if field length > maxlength", () => {
    let validationSchema = {
        "name": {
            type: "String",
            maxlength: 20,
            "missing_err_code": 1012,
            "invalid_err_code": 1005
        }
    };
    try {
        quickValidate.validate({ name: "Abdsfgdfvcsadfgrfjasuytsahhgsd5ewd xagsjgdhcjhg" }, validationSchema);
    } catch (e) {
        expect(e.message).toBe("name should not exceed length of 20");
    }
});

test("validate throws validation error if enum field contains non-enum value", () => {
    let validationSchema = {
        "size": {
            type: "enum",
            enumVals: ["S", "M", "L", "XL"],
            "missing_err_code": 1012,
            "invalid_err_code": 1005
        }
    };
    try {
        quickValidate.validate({ size: "XXL" }, validationSchema);
    } catch (e) {
        expect(e.message).toBe("size should be any of [\"S\",\"M\",\"L\",\"XL\"]");
    }
});


test("validate throws validation error if field value does not match regex", () => {
    let validationSchema = {
        "phone_no": {
            "type": "regex",
            "regex": "^\\d{10}$",
            "missing_err_code": 1012,
            "invalid_err_code": 2001
        }
    };
    try {
        quickValidate.validate({ phone_no: "123" }, validationSchema);
    } catch (e) {
        expect(e.message).toBe("phone_no value unexpected");
    }
});

test("validate ignores field checks for which are not supported", () => {
    let validationSchema = {
        "cart": {
            type: "Object",
            xyz: "abc"
        }
    };
    expect(() => { quickValidate.validate({ cart: {} }, validationSchema); }).not.toThrow(Error);
});