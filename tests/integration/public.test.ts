import request from 'supertest';
import httpStatus from 'http-status';
import app from '../../src/app';
import BaseException from '../../src/exception/BaseException';
import { ErrorCode } from '../../src/exception/ErrorCode';

describe('Public routes', () => {
    describe('GET /health', () => {
        test('should return 200 and health', async () => {
            const res = await request(app).get('/health').send().expect(httpStatus.OK);

            expect(res.body).toEqual({
                code: 0,
                response: { data: 'Working' },
                title: expect.any(String),
            });

            expect(res.body.response.data).toEqual('Working');
        });
    });

    describe('GET /', () => {
        test('should return 200 and html', async () => {
            const res = await request(app).get('/').send().expect(httpStatus.OK);

            expect(res.text).toEqual('<h2>Hello World!</h2>');
        });
    });

    describe('GET /exception', () => {
        test('should return 500', async () => {
            const res = await request(app).get('/exception').send().expect(httpStatus.INTERNAL_SERVER_ERROR);

            expect(res.body).toEqual({
                code: BaseException.CODE_DEFAULT_ERROR,
                response: {},
                title: expect.any(String),
            });

            expect(res.body.title).toEqual('Exception');
        });
    });

    describe('GET /invalid-param-exception', () => {
        test('should return 200', async () => {
            const res = await request(app).get('/invalid-param-exception').send().expect(httpStatus.OK);

            expect(res.body).toEqual({
                code: ErrorCode['InvalidParamException'].code,
                response: {},
                title: ErrorCode['InvalidParamException'].message,
            });
        });
    });

    describe('GET /base-exception', () => {
        test('should return 200', async () => {
            const res = await request(app).get('/base-exception').send().expect(httpStatus.OK);

            expect(res.body).toEqual({
                code: BaseException.CODE_DEFAULT_ERROR,
                response: {},
                title: BaseException.TEXT_DEFAULT_ERROR,
            });
        });
    });
});
