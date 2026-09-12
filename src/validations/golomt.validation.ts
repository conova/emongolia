import Joi from 'joi';

const withdraw = {
    body: Joi.object().keys({
        custid: Joi.string(),
        type: Joi.string().required(),
        registerNumber: Joi.string(),
        acctName: Joi.string().required(),
        acctNo: Joi.string().required(),
        bank: Joi.string().required(),
        amount: Joi.number().positive().required(),
        currency: Joi.string().default('MNT'),
        description: Joi.string(),
    }),
};

const statement = {
    body: Joi.object().keys({
        accountId: Joi.string().required(),
        startDate: Joi.string().required(),
        endDate: Joi.string().required(),
    }),
};

const account = {
    body: Joi.object().keys({
        type: Joi.string().required(),
        bank: Joi.string().required(),
        account: Joi.string().required(),
        name: Joi.string().required(),
        currency: Joi.string().default('MNT'),
        statement: Joi.boolean().default(false),
    }),
};

const rate = {
    query: Joi.object().keys({
        currency: Joi.string().default('MNT'),
    }),
};

const balance = {
    body: Joi.object().keys({
        accountId: Joi.string().required(),
        registerNo: Joi.string().required(),
    }),
};

const accountDetails = {
    body: Joi.object().keys({
        accountId: Joi.string().required(),
        registerNo: Joi.string().required(),
    }),
};

const accountList = {
    body: Joi.object().keys({
        registerNo: Joi.string().required(),
    }),
};

const accountType = {
    body: Joi.object().keys({
        accountId: Joi.string().required(),
        registerNo: Joi.string(),
    }),
};

const accountCheck = {
    body: Joi.object().keys({
        accountId: Joi.string().required(),
        bankCode: Joi.string(),
    }),
};

export { withdraw, statement, account, rate, balance, accountDetails, accountList, accountType, accountCheck };
