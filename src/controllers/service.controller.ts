import { Request, Response } from 'express';

import { singleton } from 'tsyringe';

import pick from '../utils/pick';
import catchAsync from '../utils/catchAsync';

import { JsonResponse } from '../utils/utils';
import { WsdlService } from '../services';
import { SERVICES, STATUS_SERVICES } from '@prisma/client';

@singleton()
export default class eMongoliaController {
    private readonly wsdlService: WsdlService;

    constructor(wsdlService: WsdlService) {
        this.wsdlService = wsdlService;
    }

    getServiceList = catchAsync(async (req: Request, res: Response) => {
        type TStatus = keyof typeof STATUS_SERVICES;
        const { status } = pick(req.query, ['status']);
        const serviceList = await this.wsdlService.getServiceList(<TStatus>status);

        JsonResponse(res, serviceList);
    });

    getService = catchAsync(async (req: Request, res: Response) => {
        const { code } = pick(req.params, ['code']);
        const serviceList = await this.wsdlService.getServiceByCode(<SERVICES>code);

        JsonResponse(res, serviceList);
    });

    createService = catchAsync(async (req: Request, res: Response) => {
        const { code, key, desc, wsdl, params } = pick(req.body, [
            'code',
            'key',
            'desc',
            'type',
            'sourceType',
            'wsdl',
            'params',
        ]);
        const service = await this.wsdlService.insertService(
            <SERVICES>code,
            <string>key,
            <string>desc,
            <string>wsdl,
            <string>params
        );

        JsonResponse(res, service);
    });

    updateService = catchAsync(async (req: Request, res: Response) => {
        const { code } = pick(req.params, ['code']);
        const { key, desc, wsdl, params, status } = pick(req.body, ['key', 'desc', 'wsdl', 'params', 'status']);
        const service = await this.wsdlService.updateService(<SERVICES>code, {
            status: <STATUS_SERVICES>status,
            desc: <string>desc,
            key: <string>key,
            wsdl: <string>wsdl,
            params: <string>params,
        });

        JsonResponse(res, service);
    });

    removeService = catchAsync(async (req: Request, res: Response) => {
        const { code } = pick(req.params, ['code']);
        const service = await this.wsdlService.updateService(<SERVICES>code, {
            status: STATUS_SERVICES.INACTIVE,
        });

        JsonResponse(res, service);
    });
}
