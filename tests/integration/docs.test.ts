import request from 'supertest';
import httpStatus from 'http-status';
import app from '../../src/app';
import config from '../../config/config';

describe('Docs routes', () => {
    describe('GET /docs', () => {
        test('should return 200 but return base exception when running in production', async () => {
            config.env = 'prod';
            const res = await request(app).get('/docs').send().expect(httpStatus.OK);

            expect(res.body).toEqual({
                code: httpStatus.NOT_FOUND,
                response: {},
                title: 'Not found',
            });

            config.env = process.env.NODE_ENV;
        });
    });
});
