import httpStatus from 'http-status';
import { errorHandler } from '../../../src/middlewares/error';
import BaseException from '../../../src/exception/BaseException';
import config from '../../../config/config';
import logger from '../../../config/logger';
import httpMocks from 'node-mocks-http';

describe('Error middlewares', () => {
    describe('Error handler', () => {
        beforeEach(() => {
            jest.spyOn(logger, 'error').mockImplementation(() => logger);
        });

        test('should send proper error response and put the error message in res.locals', () => {
            const error = new BaseException('Any error', httpStatus.BAD_REQUEST);
            const res = httpMocks.createResponse();
            const sendSpy = jest.spyOn(res, 'send');
            const next = jest.fn();

            errorHandler(error, httpMocks.createRequest(), res, next);

            expect(sendSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: error.errorCode,
                    response: {},
                    title: error.message,
                })
            );
            expect(res.locals.errorMessage).toBe(error.message);
        });

        test('should put the error stack in the response if in development mode', () => {
            config.env = 'dev';
            const error = new BaseException('Any error', httpStatus.BAD_REQUEST);
            const res = httpMocks.createResponse();
            const sendSpy = jest.spyOn(res, 'send');
            const next = jest.fn();

            errorHandler(error, httpMocks.createRequest(), res, next);

            expect(sendSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: error.errorCode,
                    response: {},
                    title: error.message,
                    stack: error.stack,
                })
            );
            config.env = process.env.NODE_ENV;
        });

        test('should send internal server error status and message if in production mode and error is not operational', () => {
            config.env = 'prod';
            const expected = 'Unexpected error';
            const error = new BaseException(expected, httpStatus.BAD_REQUEST, undefined, false);
            const res = httpMocks.createResponse();
            const sendSpy = jest.spyOn(res, 'send');
            const next = jest.fn();

            errorHandler(error, httpMocks.createRequest(), res, next);

            expect(sendSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: httpStatus.BAD_REQUEST,
                    response: {},
                    title: expected,
                })
            );
            expect(res.locals.errorMessage).toBe(error.message);
            config.env = process.env.NODE_ENV;
        });

        test('should preserve original error status and message if in production mode and error is operational', () => {
            config.env = 'prod';
            const error = new BaseException('Any error', httpStatus.BAD_REQUEST);
            const res = httpMocks.createResponse();
            const sendSpy = jest.spyOn(res, 'send');
            const next = jest.fn();

            errorHandler(error, httpMocks.createRequest(), res, next);

            expect(sendSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: error.errorCode,
                    response: {},
                    title: error.message,
                })
            );
            config.env = process.env.NODE_ENV;
        });
    });
});
