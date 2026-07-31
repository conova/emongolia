import { Request, Response } from 'express';

import { singleton } from 'tsyringe';
import { PAYMENT_ACTION, TXN_TYPE } from '@prisma/client';

import pick from '../utils/pick';
import catchAsync from '../utils/catchAsync';

import { JsonResponse } from '../utils/utils';
import PaymentService from '../services/payment.service';

@singleton()
export default class PaymentController {
    private readonly paymentService: PaymentService;

    constructor(paymentService: PaymentService) {
        this.paymentService = paymentService;
    }

    createLink = catchAsync(async (req: Request, res: Response) => {
        const { custid, amount, txntype, action } = pick(req.body, ['custid', 'amount', 'txntype', 'action']);

        const result = await this.paymentService.createPaymentLink(
            <string>custid,
            <number>amount,
            <TXN_TYPE>txntype,
            <PAYMENT_ACTION>action
        );

        JsonResponse(res, result);
    });

    checkPayment = catchAsync(async (req: Request, res: Response) => {
        const { tranid, checkid } = pick(req.query, ['tranid', 'checkid']);

        try {
            const notified = await this.paymentService.checkPayment(<string>tranid, <string>checkid);

            if (notified.success) return res.redirect('/dan/result?result=success');

            return res.redirect(
                '/dan/result?result=fail&errorMessage=' +
                    encodeURIComponent('Payment notification failed (' + notified.code + ')')
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : <string>error;

            return res.redirect('/dan/result?result=fail&errorMessage=' + encodeURIComponent(message));
        }
    });
}
