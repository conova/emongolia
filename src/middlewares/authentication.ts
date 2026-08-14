import { NextFunction, Request, Response } from 'express';
import { injectable } from 'tsyringe';
import jwt, { JwtPayload } from 'jsonwebtoken';

import fs from 'fs';
import crypto from 'crypto';
import httpStatus from 'http-status';

import config from '../../config/config';
import BaseException from '../exception/BaseException';
import { JsonResponse } from '../utils/utils';

interface Itoken extends JwtPayload {
    id: string;
}

@injectable()
export default class Authentication {
    private readonly hesSalt = config.hes_salt;
    private readonly hesClientId = config.hes_client_id;
    private readonly publicKeyPath = config.hes_public_key_path;

    private getPublicKey = () => {
        if (!fs.existsSync(this.publicKeyPath)) {
            throw new BaseException('Public key missing', httpStatus.UNAUTHORIZED);
        }

        return fs.readFileSync(this.publicKeyPath);
    };

    verify = () => (req: Request, res: Response, next: NextFunction) => {
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer '))
            return next(new BaseException('Missing Authorization header', httpStatus.UNAUTHORIZED));

        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
            return next(new BaseException('Missing Authorization token', httpStatus.UNAUTHORIZED));
        }

        const publicKey = this.getPublicKey();

        try {
            const decoded = <Itoken>jwt.verify(token, publicKey);

            const decrypter = crypto.createDecipheriv('aes-128-ecb', this.hesSalt, null);
            let decryptedMsg = decrypter.update(decoded.id, 'hex', 'utf8');
            decryptedMsg += decrypter.final('utf8');

            if (decryptedMsg !== this.hesClientId) {
                return next(JsonResponse(res, [], httpStatus[401], httpStatus.UNAUTHORIZED, httpStatus.UNAUTHORIZED));
            }
        } catch (error) {
            return next(JsonResponse(res, [], httpStatus[401], httpStatus.UNAUTHORIZED, httpStatus.UNAUTHORIZED));
        }

        return next();
    };

    verifyIp = () => (req: Request, res: Response, next: NextFunction) => {
        // no allowlist configured: restriction is disabled
        if (config.allowed_ips.length === 0) return next();

        const forwarded = <string>req.headers['x-forwarded-for'];
        const ip = (forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress ?? '')
            .trim()
            .replace(/^::ffff:/, '');

        if (!config.allowed_ips.includes(ip)) return next(new BaseException('Forbidden', httpStatus.FORBIDDEN));

        return next();
    };

    verifyApiKey = () => (req: Request, res: Response, next: NextFunction) => {
        const apiKey = req.headers['x-api-key'];

        // an empty configured key must never match — it would leave the endpoint open
        if (!config.x_api_key || apiKey !== config.x_api_key)
            return next(new BaseException('Invalid api key', httpStatus.UNAUTHORIZED));

        return next();
    };
}
