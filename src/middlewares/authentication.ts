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
}
