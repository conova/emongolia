import { Response } from 'express';
import httpStatus from 'http-status';
import crypto from 'crypto';

export const parseJson = (jsonString: string) => {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        return jsonString;
    }
};

export const stateGenerator = async (unique: string) => {
    const dd = new Date();
    const timestamp = dd.getTime();
    const randomBytes = crypto.randomBytes(16).toString('hex');

    return await crypto.createHash('sha256').update(JSON.stringify({ unique, timestamp, randomBytes })).digest('hex');
};

export const JsonResponse = (
    res: Response,
    response: unknown = {},
    title = 'Success',
    code = 0,
    httpCode: number = httpStatus.OK
) => {
    res.status(httpCode).send({
        code,
        response,
        title,
    });
};
