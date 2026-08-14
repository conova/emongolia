import { Request, Response } from 'express';

import { singleton } from 'tsyringe';

import pick from '../utils/pick';
import catchAsync from '../utils/catchAsync';

import { JsonResponse } from '../utils/utils';
import GolomtService, { IAccountInput, IWithdrawInput } from '../services/golomt.service';

@singleton()
export default class GolomtController {
    private readonly golomtService: GolomtService;

    constructor(golomtService: GolomtService) {
        this.golomtService = golomtService;
    }

    withdraw = catchAsync(async (req: Request, res: Response) => {
        const input = pick(req.body, [
            'custid',
            'type',
            'registerNumber',
            'acctName',
            'acctNo',
            'bank',
            'amount',
            'currency',
            'description',
        ]);

        const withdraw = await this.golomtService.withdraw(<IWithdrawInput>(<unknown>input));

        JsonResponse(res, withdraw);
    });

    statement = catchAsync(async (req: Request, res: Response) => {
        const { accountId, startDate, endDate } = pick(req.body, ['accountId', 'startDate', 'endDate']);

        const result = await this.golomtService.statement(<string>accountId, <string>startDate, <string>endDate);

        JsonResponse(res, result);
    });

    saveAccount = catchAsync(async (req: Request, res: Response) => {
        const input = pick(req.body, ['type', 'bank', 'account', 'name', 'currency', 'statement']);

        const account = await this.golomtService.saveAccount(<IAccountInput>(<unknown>input));

        JsonResponse(res, account);
    });

    rate = catchAsync(async (req: Request, res: Response) => {
        const { currency } = pick(req.query, ['currency']);

        const rate = await this.golomtService.rate(<string>currency);

        JsonResponse(res, rate);
    });

    accounts = catchAsync(async (req: Request, res: Response) => {
        const accounts = await this.golomtService.accounts();

        JsonResponse(res, accounts);
    });
}
