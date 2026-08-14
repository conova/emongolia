import { singleton } from 'tsyringe';
import crypto from 'crypto';

import config from '../../config/config';
import logger from '../../config/logger';
import Client from '../utils/client';
import { UnknownObject } from '../utils/types';

export interface IGolomtRequestOptions {
    query?: Record<string, string>;
    accessCode?: string;
}

export const GOLOMT_SERVICE = {
    LOGIN: 'LGIN',
    RATE: 'RATEINQ',
    TRANSFER: 'CGWTXNADD',
    CONFIRM: 'TXNREF',
    STATEMENT: 'OPERACCTSTA',
    BALANCE: 'ACCTBALINQ',
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

    public login = async () => {
        const response = await this.client.request(Client.METHOD_POST, '/v1/auth/login', {
            body: {
                name: config.golomt_name,
                password: this.encrypt(config.golomt_password),
            },
            headers: { 'Content-Type': 'application/json' },
        });

        this.accessToken = <string>response.token;

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
        if (options.accessCode) headers['X-Golomt-Code'] = options.accessCode;

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

            return await this.send(service, route, body, options);
        }
    };
}
