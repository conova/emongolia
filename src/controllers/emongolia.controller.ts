import { Request, Response } from 'express';

import { autoInjectable } from 'tsyringe';

import { Prisma, STATUS_REQUEST } from '@prisma/client';
import { JsonResponse, stateGenerator } from '../utils/utils';
import { eMongoliaService, WsdlService } from '../services';
import { IEMongoliaServiceStructure } from '../services/e.mongolia.service';
import { IRequestService, RequestService } from '../services/request.service';

import pick from '../utils/pick';
import catchAsync from '../utils/catchAsync';
import config from '../../config/config';
import exceptions from '../exception/Exceptions';
import logger from '../../config/logger';
import BaseException from '../exception/BaseException';

@autoInjectable()
export default class eMongoliaController {
    private readonly eService: eMongoliaService;
    private readonly wsdlService: WsdlService;
    private readonly requestService: RequestService;

    constructor(eService: eMongoliaService, wsdlService: WsdlService, requestService: RequestService) {
        this.eService = eService;
        this.wsdlService = wsdlService;
        this.requestService = requestService;
    }

    getUri = catchAsync(async (req: Request, res: Response) => {
        const { services, unique, callback } = pick(req.body, ['services', 'unique', 'callback']);

        const eMongoliaScope: IEMongoliaServiceStructure[] = [];
        const usedServices: Record<string, string | object>[] = [];

        for (const service of <IRequestService[]>services) {
            const wsdlService = await this.wsdlService.getServiceByCode(service.code);

            if (!wsdlService) throw new exceptions.ServiceNotFoundException();
            if ('ACTIVE' !== wsdlService.status) throw new BaseException('Inactive service found!');

            const params = wsdlService.params as Prisma.JsonArray;
            if (params.length && !service.params) throw new exceptions.RequiredParamMissingException();

            const key = <string>wsdlService.key;
            const wsdl = <string>wsdlService.wsdl;

            const usedService = {
                code: service.code,
                params: service.params ?? {},
            };

            if (wsdlService.wsdl) {
                const serviceStructure: IEMongoliaServiceStructure = {
                    services: [key],
                    wsdl,
                };

                if (params.length) {
                    serviceStructure.params = {
                        [wsdlService.key as string]: { ...(<object>service.params) },
                    };
                }

                eMongoliaScope.push(serviceStructure);
            } else {
                usedService.params = { ...service.params };
            }

            usedServices.push(usedService);
        }

        const state = await stateGenerator(<string>unique);
        const requestModel: Prisma.requestCreateInput = {
            unique: <string>unique,
            callback: <string>callback,
            state,
            scope: null,
            services: usedServices,
            status: STATUS_REQUEST.PENDING,
        };

        if (eMongoliaScope.length) {
            requestModel.scope = Buffer.from(JSON.stringify(eMongoliaScope), 'utf8').toString('base64');
        }

        const request = await this.requestService.create(requestModel);

        const uri = new URL('api/e/redirect/' + request.id, config.redirect_uri);
        uri.searchParams.set('state', state);

        return JsonResponse(res, { uri, state, requestId: request.id });
    });

    authorize = catchAsync(async (req: Request, res: Response) => {
        const { code, state } = pick(req.query, ['code', 'state']);

        try {
            const request = await this.requestService.getRequestByState(<string>state);

            if (!request) throw new exceptions.RequestNotFoundException();

            const result = await this.eService.authorize(<string>code, request);

            if (!result.success) {
                logger.error(`authorize: ${code} : ${state} : ${this.eService.error}`);
                if (result.code === 1008) {
                    res.redirect(
                        '/result?result=mismatch_reg&errorMessage=Харилцагчийн Регистрийн дугаар таарахгүй байна.'
                    );
                    return;
                }
                if (result.code === 1010) {
                    res.redirect(
                        '/result?result=already_registered_reg&errorMessage=Регистрийн дугаар бүртгэлтэй байна.'
                    );
                    return;
                }
                res.redirect('/result?result=failed&errorMessage=Алдаа гарлаа');
                return;
            }

            res.redirect('/result?result=success');
            return;
        } catch (error) {
            logger.error(error);
    	    logger.error(`authorize: ${code} : ${state} : ${error instanceof Error ? error.message : <string>error}`);
            res.redirect('/result?result=failed&errorMessage=Алдаа гарлаа');
            return;
        }
    });

    redirect = catchAsync(async (req: Request, res: Response) => {
        const { requestId: reqId } = pick(req.params, ['requestId']);
        const { state, mobile } = pick(req.query, ['state', 'mobile']);

        if (!state || !reqId) throw new exceptions.RequiredParamMissingException();

        let request = await this.requestService.getRequestById(+(<number>reqId));
        if (!request) throw new exceptions.RequestNotFoundException();

        if (state !== request.state) throw new exceptions.StateIsNotSameException();

        request = await this.requestService.updateRequestById(request.id, { status: STATUS_REQUEST.ENTERED });

        if ('sandbox' === process.env.NODE_ENV && !mobile) {
            const result = await this.eService.sandboxNotif(request);

            JsonResponse(res, [], result ? 'SUCCESS' : 'FAIL');
            return;
        }

        const uri = new URL('oauth2/authorize', config.emongolia_uri);
        uri.searchParams.set('response_type', 'code');
        uri.searchParams.set('client_id', config.emongolia_client_id);
        uri.searchParams.set('redirect_uri', config.emongolia_redirect_uri);
        uri.searchParams.set('scope', <string>request.scope);
        uri.searchParams.set('state', <string>state);

        res.redirect(uri.toString());
    });

    requestStatus = catchAsync(async (req: Request, res: Response) => {
        const { requestId, state } = pick(req.query, ['requestId', 'state']);
        const request = await this.requestService.getRequestWithResponse(+(<number>requestId), <string>state);

        JsonResponse(res, request);
    });
}
