import { Response, Request, NextFunction } from 'express';
import httpStatus from 'http-status';
import config from '../../config/config';
import logger from '../../config/logger';
import BaseException, { IBaseException } from '../exception/BaseException';
import { ErrorCode, IException } from '../exception/ErrorCode';
import { parseJson } from '../utils/utils';

const errorHandler = (err: BaseException, req: Request, res: Response, next: NextFunction) => {
    let { errorCode: code, message }: IBaseException = err;
    const { exception: exceptionName } = err;

    type ObjectKey = keyof typeof ErrorCode;
    const exception = ErrorCode[exceptionName as ObjectKey] as IException;

    message = message || (exception ? exception.message : BaseException.TEXT_DEFAULT_ERROR);
    code = code || (exception ? exception.code : BaseException.CODE_DEFAULT_ERROR);

    message = parseJson(message);

    res.locals.errorMessage = err.message;

    const response = {
        code,
        response: {},
        title: message,
        ...(config.env === 'dev' && { stack: err.stack }),
    };

    if (config.env === 'dev') {
        logger.error(err);
    }

    if (err instanceof BaseException) {
        res.status(httpStatus.OK).send(response);
        return next();
    }

    res.status(httpStatus.INTERNAL_SERVER_ERROR).send(response);
    return next();
};

export { errorHandler };
