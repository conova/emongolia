import httpStatus from 'http-status';
import fetch from 'node-fetch';
import logger from '../../config/logger';
import BaseException from '../exception/BaseException';
import pick from './pick';
import FormData from 'form-data';
import { UnknownObject } from './types';
import { Agent } from 'https';

export default class Client {
    static METHOD_POST = 'POST';
    static METHOD_GET = 'GET';
    static METHOD_PUT = 'PUT';

    public _baseUrl: string;

    agent = new Agent({
        rejectUnauthorized: false,
    });

    constructor(baseUrl: string) {
        this._baseUrl = baseUrl;
    }

    public get baseUrl(): string {
        return this._baseUrl;
    }

    public set baseUrl(baseUrl: string) {
        this._baseUrl = baseUrl;
    }

    public request = async (method: string, route: string, init: UnknownObject | undefined = undefined) => {
        const options: UnknownObject = {};
        if (init) {
            const headers: UnknownObject = <UnknownObject>init.headers;
            const paramsObject = <UnknownObject>pick(init, ['form', 'body', 'query']);
            if (paramsObject.query) {
                route += '?';
                route += new URLSearchParams(<Record<string, string>>paramsObject.query);
            } else if (paramsObject.form) {
                const formData = new FormData();
                const form = <UnknownObject>paramsObject.form;
                Object.keys(form).forEach((key) => formData.append(key, form[key]));
                options.body = formData;
            } else {
                headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(paramsObject.body);
            }
            if (headers) options.headers = headers;
        }

        const uri =
            this._baseUrl.endsWith('/') || route.startsWith('/') ? this._baseUrl + route : this._baseUrl + '/' + route;

        logger.info(uri + '::' + method);

        if (uri.indexOf('https') !== -1) options.agent = this.agent;

        const rawResponse = await fetch(uri, {
            method,
            ...options,
        });

        const isJson = rawResponse.headers.get('content-type')?.includes('application/json');
        let res = undefined;
        if (isJson) res = await rawResponse.json();
        else res = await rawResponse.text();

        if (this._baseUrl.toLowerCase().includes('payon'))
            logger.info('Client HTTP CODE: ' + rawResponse.status + '::' + JSON.stringify(res));
        else logger.info('Client HTTP CODE: ' + rawResponse.status);

        if (rawResponse.status !== httpStatus.OK) {
            throw new BaseException(JSON.stringify(res), 1000);
        } else {
            if (Array.isArray(res)) {
                if (typeof res[0] === 'object' && res[0]['message']) {
                    if (res[0]['message'] == 'Regnum is not matched') throw new BaseException(res[0]['message'], 1008);
                }
            }
        }

        return res;
    };
}
