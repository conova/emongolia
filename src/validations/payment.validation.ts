import Joi from 'joi';

import { PAYMENT_ACTION, TXN_TYPE } from '@prisma/client';

const createLink = {
    body: Joi.object().keys({
        custid: Joi.string().required(),
        amount: Joi.number().positive().required(),
        currency: Joi.string().default('MNT'),
        txntype: Joi.string()
            .valid(...Object.values(TXN_TYPE))
            .required(),
        action: Joi.string()
            .valid(...Object.values(PAYMENT_ACTION))
            .required(),
    }),
};

const checkPayment = {
    query: Joi.object().keys({
        tranid: Joi.string().required(),
        checkid: Joi.string().required(),
    }),
};

export { createLink, checkPayment };
