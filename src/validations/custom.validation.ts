const isNumber = (value: any, helpers: any) => {
    const number = parseInt(value);
    if (isNaN(number)) {
        return helpers.message('{{#label}} must be a valid number');
    }
    return number;
};

const password = (value: any, helpers: any) => {
    if (value.length < 8) {
        return helpers.message('password must be at least 8 characters');
    }
    if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
        return helpers.message('password must contain at least 1 letter and 1 number');
    }
    return value;
};

export { isNumber, password };
