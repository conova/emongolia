import Joi from 'joi';

import { STATUS_SERVICES } from '@prisma/client';
import { isNumber } from './custom.validation';

const getUri = {
    body: Joi.object().keys({
        services: Joi.array().items({
            code: Joi.string().required(),
            params: Joi.object(),
        }),
        unique: Joi.string().required(),
        callback: Joi.string().required(),
    }),
};

const createService = {
    body: Joi.object().keys({
        code: Joi.string().required(),
        key: Joi.string().required(),
        desc: Joi.string().required(),
        wsdl: Joi.string().required(),
        params: Joi.array().items({
            param: Joi.string().required(),
            desc: Joi.string().required(),
            type: Joi.string().valid('string', 'int', 'boolean').required(),
        }),
    }),
};

const serviceCode = {
    params: Joi.object().keys({
        code: Joi.string().required(),
    }),
};

const updateService = {
    body: Joi.object().keys({
        code: Joi.string(),
        desc: Joi.string(),
        key: Joi.string(),
        wsdl: Joi.string(),
        params: Joi.array().items({
            param: Joi.string(),
            desc: Joi.string(),
            type: Joi.string().valid('string', 'int', 'boolean'),
        }),
        status: Joi.string().valid(STATUS_SERVICES.ACTIVE, STATUS_SERVICES.INACTIVE),
    }),
};

const serviceList = {
    query: Joi.object().keys({
        status: Joi.string().valid(STATUS_SERVICES.ACTIVE, STATUS_SERVICES.INACTIVE),
    }),
};

const checkRequest = {
    query: Joi.object().keys({
        requestId: Joi.number().custom(isNumber).required(),
        state: Joi.string().required(),
    }),
};

export { getUri, serviceCode, createService, updateService, serviceList, checkRequest };
