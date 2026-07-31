import Joi from 'joi';

import { PAYMENT_ACTION, TXN_TYPE } from '@prisma/client';
import { isNumber } from './custom.validation';

const createLink = {
    body: Joi.object().keys({
        custid: Joi.string().required(),
        amount: Joi.number().positive().required(),
        txntype: Joi.string()
            .valid(...Object.values(TXN_TYPE))
            .required(),
        action: Joi.string()
            .valid(...Object.values(PAYMENT_ACTION))
            .required(),
    }),
};

const checkPayment = {
    params: Joi.object().keys({
        id: Joi.number().custom(isNumber).required(),
    }),
};

export { createLink, checkPayment };
