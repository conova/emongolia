import { singleton } from 'tsyringe';
import crypto from 'crypto';

import config from '../../config/config';
import logger from '../../config/logger';
import BaseException from '../exception/BaseException';
import Client from '../utils/client';
import { UnknownObject } from '../utils/types';

export interface IGolomtRequestOptions {
    query?: Record<string, string>;
    /// attach the X-Golomt-Code header (TOTP generated from GOLOMT_KEY env)
    withGolomtCode?: boolean;
}

export const GOLOMT_SERVICE = {
    LOGIN: 'LGIN',
    RATE: 'RATEINQ',
    TRANSFER: 'CGWTXNADD',
    CONFIRM: 'TXNREF',
    STATEMENT: 'OPERACCTSTA',
    BALANCE: 'ACCTBALINQ',
    ACCOUNT_DETAILS: 'OPERACCTDET',
    ACCOUNT_CHECK: 'ACCCHK',
};

@singleton()
export default class GolomtClient {
    private accessToken: string | null = null;

    private readonly client = new Client(config.golomt_url);

    private get sessionKey() {
        return Buffer.from(config.golomt_session_key, 'latin1');
    }

    private get ivKey() {
        return Buffer.from(config.golomt_iv_key, 'latin1');
    }

    private get algorithm() {
        if (this.sessionKey.length === 32) return 'aes-256-cbc';
        if (this.sessionKey.length === 24) return 'aes-192-cbc';
        return 'aes-128-cbc';
    }

    private encrypt = (text: string) => {
        const cipher = crypto.createCipheriv(this.algorithm, this.sessionKey, this.ivKey);
        return Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]).toString('base64');
    };

    private decrypt = (encoded: string) => {
        const decipher = crypto.createDecipheriv(this.algorithm, this.sessionKey, this.ivKey);
        return Buffer.concat([decipher.update(Buffer.from(encoded, 'base64')), decipher.final()]).toString('utf8');
    };

    /// SHA256 hex of the exact request body, AES encrypted — X-Golomt-Checksum header
    private checksum = (body: string) => this.encrypt(crypto.createHash('sha256').update(body).digest('hex'));

    private decodeBase32 = (secret: string) => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

        let bits = 0;
        let value = 0;
        const bytes: number[] = [];

        for (const ch of secret.toUpperCase()) {
            if (ch === '=') break;

            const index = alphabet.indexOf(ch);
            if (index === -1) throw new Error('Invalid base-32 character: ' + ch);

            value = (value << 5) | index;
            bits += 5;

            if (bits >= 8) {
                bytes.push((value >>> (bits - 8)) & 0xff);
                bits -= 8;
            }
        }

        // the bank's reference implementation keeps the trailing partial byte
        if (bits > 0) bytes.push((value << (8 - bits)) & 0xff);

        return Buffer.from(bytes);
    };

    /// X-Golomt-Code: TOTP (6 digits, 30s step, HmacSHA1) from the bank issued base32 key
    private generateCode = (timeMillis: number = Date.now(), timeStepSeconds = 30) => {
        const key = this.decodeBase32(config.golomt_key);

        const data = Buffer.alloc(8);
        let counter = Math.floor(timeMillis / 1000 / timeStepSeconds);
        for (let i = 7; counter > 0; i--) {
            data[i] = counter & 0xff;
            counter = Math.floor(counter / 256);
        }

        const hash = crypto.createHmac('sha1', key).update(data).digest();
        const offset = hash[hash.length - 1] & 0xf;
        const truncated = (hash.readUInt32BE(offset) & 0x7fffffff) % 1000000;

        return String(truncated).padStart(6, '0');
    };

    public login = async () => {
        const response = await this.client.request(Client.METHOD_POST, '/v1/auth/login', {
            body: {
                name: config.golomt_name,
                password: this.encrypt(config.golomt_password),
            },
            headers: { 'Content-Type': 'application/json' },
        });

        this.accessToken = <string>response.token;

        logger.info('Golomt login: token ' + (this.accessToken ? 'received' : 'MISSING'));

        return this.accessToken;
    };

    private send = async (service: string, route: string, body: UnknownObject, options: IGolomtRequestOptions) => {
        if (!this.accessToken) await this.login();

        const headers: UnknownObject = {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + this.accessToken,
            'X-Golomt-Checksum': this.checksum(JSON.stringify(body)),
            'X-Golomt-Service': service,
        };
        if (options.withGolomtCode && config.golomt_key) headers['X-Golomt-Code'] = this.generateCode();

        let uri = route;
        if (options.query) uri += '?' + new URLSearchParams(options.query);

        const response = await this.client.request(Client.METHOD_POST, uri, { body, headers });

        // responses come back AES encrypted as base64 text
        if (typeof response === 'string' && response.length > 0) {
            try {
                return JSON.parse(this.decrypt(response));
            } catch (error) {
                const message = error instanceof Error ? error.message : <string>error;
                logger.error('Golomt response decrypt failed: ' + message);

                return response;
            }
        }

        return response;
    };

    /// non-200 responses carry an AES encrypted body too — decrypt it so the
    /// real bank error is readable instead of base64 ciphertext
    private decodeError = (error: unknown) => {
        if (!(error instanceof BaseException)) return error;

        try {
            const encoded = JSON.parse(error.message);
            if (typeof encoded !== 'string' || encoded.length === 0) return error;

            return new BaseException(this.decrypt(encoded), error.errorCode);
        } catch (ignored) {
            return error;
        }
    };

    public request = async (
        service: string,
        route: string,
        body: UnknownObject,
        options: IGolomtRequestOptions = {}
    ) => {
        try {
            return await this.send(service, route, body, options);
        } catch (error) {
            // token may be expired: login again and retry once
            this.accessToken = null;

            try {
                return await this.send(service, route, body, options);
            } catch (retryError) {
                throw this.decodeError(retryError);
            }
        }
    };
}
