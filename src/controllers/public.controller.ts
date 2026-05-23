import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import BaseException from '../exception/BaseException';
import Exceptions from '../exception/Exceptions';
import { JsonResponse } from '../utils/utils';
import path from 'path';

const homeAction = catchAsync(async (req: Request, res: Response) => {
    res.set('Content-Type', 'text/html');
    res.send(Buffer.from('<h2>Hello World!</h2>'));
});

const healthCheck = catchAsync(async (req: Request, res: Response) => {
    JsonResponse(res, { data: 'Working' });
});

const result = catchAsync(async (req: Request, res: Response) => {
    res.setHeader('Content-Security-Policy', "script-src 'nonce-i2726c7f26b'");
    res.sendFile(path.join(__dirname, '..', '..', '/templates/result.html'));
});

const invalidParamExceptionThrower = catchAsync(async () => {
    throw new Exceptions.InvalidParamException();
});

const baseExceptionThrower = catchAsync(async () => {
    throw new BaseException();
});

const exceptionThrower = catchAsync(async () => {
    throw new Error('Exception');
});

const ignoreFavicon = catchAsync(async (req: Request, res: Response) => {
    res.status(204);
    res.send(null);
});

export {
    homeAction,
    healthCheck,
    result,
    invalidParamExceptionThrower,
    baseExceptionThrower,
    exceptionThrower,
    ignoreFavicon,
};
