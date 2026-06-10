import { autoInjectable, inject } from 'tsyringe';
import { PrismaClient, request, SERVICES, STATUS_REQUEST } from '@prisma/client';

import config from '../../config/config';
import Client from '../utils/client';
import { UnknownObject } from '../utils/types';
import BaseException from '../exception/BaseException';

import * as sandbox from '../../data/sandbox/sandbox';
import exceptions from '../exception/Exceptions';
import BaseService from './base.service';
import HESNotifService from './hes.notif.service';
import WsdlService from './wsdl.service';
import logger from '../../config/logger';

export interface IEMongoliaServiceStructure {
    services: string[];
    wsdl: string;
    params?: Record<string, unknown>;
}
interface Transaction {
    paid: boolean;
    year: number;
    month: number;
    domName: string;
    orgName: string;
    orgSiID: string;
    salaryFee: number;
    salaryAmount: number;
}

@autoInjectable()
export default class eMongolia extends BaseService {
    static EMONGOLIA_ERRORCODE: Record<number, string> = {
        0: 'SUCCESS',
        1: 'EMPTY',
    };

    private readonly client: Client;
    private clientId = config.emongolia_client_id;
    private clientSecret = config.emongolia_client_secret;
    private eMonRedirectUri = config.emongolia_redirect_uri;

    private _error = '';

    private _pathToken = '/token';
    private _pathService = '/api/v1/service';

    constructor(
        hesNotifService: HESNotifService,
        wsdlService: WsdlService,
        @inject('PrismaClient') prisma: PrismaClient
    ) {
        super(hesNotifService, wsdlService, prisma);
        this.client = new Client(config.emongolia_uri);
    }

    public get error(): string {
        return this._error;
    }

    private getAccessToken = async (code: string) => {
        const tokenJson = await this.client.request(Client.METHOD_POST, this._pathToken, {
            form: {
                grant_type: 'authorization_code',
                code,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.eMonRedirectUri,
            },
        });

        if (tokenJson.error) {
            logger.error('getAccessToken: ' + tokenJson.error);
            this._error = tokenJson.error;
            return false;
        }

        return tokenJson.access_token;
    };

    private serviceCall = async (token: string) => {
        const result = await this.client.request(Client.METHOD_GET, this._pathService, {
            headers: { Authorization: 'Bearer ' + token },
        });

        if (result.error) {
            logger.error('serviceCall: ' + result.error);
            this._error = result.error;
            return false;
        }

        return result;
    };

    private prepareRequestParams = async (
        responses: Record<string, unknown>[],
        unique: string,
        reqId: number
    ): Promise<Record<string, unknown> | false> => {
        const requestParams: Record<string, unknown> = { unique, requestId: reqId };

        for (const response of responses) {
            if (response.services) {
                const services = <Record<string, unknown>>response.services;
                const key = Object.keys(services)[0];

                const service = await this.wsdlService.getServiceByKey(key);
                if (!service) throw new BaseException(`Service not found with key: ${key}`);

                const code = <string>service.code;

                const eService = <UnknownObject>services[key];
                logger.error(JSON.stringify(eService));

                const resultCode = <number>eService.resultCode;
                const message = eMongolia.EMONGOLIA_ERRORCODE[resultCode] || 'FAIL';

                if (SERVICES.CITIZEN_ADDRESS_INFO === code && eService.response) {
                    const addressResponse = <Record<string, string>>eService.response;

                    addressResponse.streetName = addressResponse.addressRegionName + addressResponse.addressStreetName;
                    addressResponse.townName = addressResponse.addressTownName;
                    addressResponse.apartmentName =
                        addressResponse.addressApartmentName + '-р байр ' + addressResponse.addressDetail + ' тоот';
                }

                if (
                    SERVICES.CITIZEN_ID_CARD_INFO == code &&
                    eService.response &&
                    eService.response.birthDateAsText.length == 16
                ) {
                    eService.response.birthDateAsText += ':00.0';
                }

                if (SERVICES.SALARY_INCOME === code && eService.response) {
                    const transactions: Transaction[] = eService.response.list;

                    let need = true;
                    let n2023 = [];

                    for (let tran of transactions) {
                        if (tran.year == 2024 && tran.month == 1) {
                            need = false;
                        }
                        if (tran.year == 2023) {
                            n2023[tran.month] = tran;
                        }
                    }
                    if (!n2023.hasOwnProperty(12)) {
                        need = false;
                    }

                    if (need) {
                        let avgFee = 0;
                        let avgSalary = 0;
                        let countMonth = 0;
                        for (let i = 8; i <= 12; i++) {
                            if (n2023.hasOwnProperty(i)) {
                                countMonth++;
                                avgFee += n2023[i].salaryFee;
                                avgSalary += n2023[i].salaryAmount;
                            }
                        }

                        eService.response.list.push({
                            paid: 1,
                            year: 2024,
                            month: 1,
                            domName: n2023[12].domName,
                            orgName: n2023[12].orgName,
                            orgSiID: n2023[12].orgSiID,
                            salaryFee: avgFee / countMonth,
                            salaryAmount: avgSalary / countMonth,
                        });
                    }
                }

                requestParams[code] = {
                    key,
                    requestParams: eService.request,
                    requestId: eService.requestId,
                    response: eService.response,
                    errorCode: resultCode,
                    errorMessage: message,
                };
            }
        }

        return requestParams;
    };

    public authorize = async (code: string | null, request: request) => {
        if (!code) throw new exceptions.InvalidParamException();

        if (STATUS_REQUEST.ENTERED !== request.status) throw new BaseException('User not entered request!');

        const token = await this.getAccessToken(code);
        if (!token) return { success: false, code: -1 };

        const result = await this.serviceCall(token);
        if (!result) return { success: false, code: -2 };

        const requestParams = await this.prepareRequestParams(result, request.unique, request.id);
        if (!requestParams) return { success: false, code: -3 };

        logger.info(requestParams);
	this.logToFile(request.state, requestParams);
        const isNotified = await this.hesNotifService.notif(requestParams, request.callback);

        let status = <string>STATUS_REQUEST.FAILED;
        if (isNotified.success) status = <string>STATUS_REQUEST.DONE;

        await this.db.request.update({
            where: { id: request.id },
            data: { status: <STATUS_REQUEST>status },
        });

        return isNotified;
    };

    public sandboxNotif = async (request: request) => {
        if (!request.scope) throw new BaseException('Not a Emongolia request');

        const result = sandbox.generate(request.scope, request.unique);

        if (STATUS_REQUEST.DONE === request.status) throw new BaseException('Request already done');

        const requestParams = await this.prepareRequestParams(result, request.unique, request.id);
        if (!requestParams) return false;

        this.logToFile(request.state, requestParams);
        const isNotified = await this.hesNotifService.notif(requestParams, request.callback);

        let status = <string>STATUS_REQUEST.FAILED;
        if (isNotified) status = <string>STATUS_REQUEST.DONE;

        await this.db.request.update({
            where: { id: request.id },
            data: { status: <STATUS_REQUEST>status },
        });

        return true;
    };
}
