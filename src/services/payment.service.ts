import { inject, singleton } from 'tsyringe';
import { PAYMENT_ACTION, PrismaClient, TXN_TYPE } from '@prisma/client';

import config from '../../config/config';
import logger from '../../config/logger';
import BaseException from '../exception/BaseException';
import NegdiService from './negdi.service';
import HESNotifService from './hes.notif.service';

@singleton()
export default class PaymentService {
    private readonly negdiService: NegdiService;
    private readonly hesNotifService: HESNotifService;
    private readonly db: PrismaClient;

    constructor(
        negdiService: NegdiService,
        hesNotifService: HESNotifService,
        @inject('PrismaClient') prisma: PrismaClient
    ) {
        this.negdiService = negdiService;
        this.hesNotifService = hesNotifService;
        this.db = prisma;
    }

    public createPaymentLink = async (custid: string, amount: number, txntype: TXN_TYPE, action: PAYMENT_ACTION) => {
        const payment = await this.db.payment.create({
            data: { custid, amount, txntype, action },
        });

        const ordernum = String(payment.id);

        try {
            const ordertype = action === PAYMENT_ACTION.QR ? 'QPAY' : '3dsOrder';
            const result = await this.negdiService.createOrder(amount, ordernum, `${txntype}:${custid}`, ordertype);

            if (!result || !result.order || !result.order.negdiurl)
                throw new BaseException('NEGDI order response is invalid', 2001);

            await this.db.payment.update({
                where: { id: payment.id },
                data: {
                    ordernum,
                    tranid: result.order.tranid,
                    checkid: result.order.checkid,
                    status: result.order.status,
                    negdiurl: result.order.negdiurl,
                    ordersign: result.ordersign,
                },
            });

            return { negdiurl: result.order.negdiurl };
        } catch (error) {
            const message = error instanceof Error ? error.message : <string>error;
            logger.error('NEGDI order failed: ' + ordernum + '::' + message);

            await this.db.payment.update({
                where: { id: payment.id },
                data: { ordernum, status: 'Failed' },
            });

            throw error;
        }
    };

    public checkPayment = async (tranid: string, checkid: string) => {
        const payment = await this.db.payment.findFirst({ where: { tranid, checkid } });
        if (!payment) throw new BaseException('Payment not found', 2002);

        if (!config.hes_payment_uri) throw new BaseException('HES payment uri is not configured', 2003);

        const txntype = payment.txntype.charAt(0) + payment.txntype.slice(1).toLowerCase();
        const params = {
            uid: payment.custid,
            date: payment.createdAt.toISOString().replace(/\.\d{3}Z$/, 'Z'),
            amount: Number(payment.amount),
            description: `${txntype} ${payment.custid}`,
            type: payment.txntype,
            transaction: payment.tranid,
        };

        const notified = await this.hesNotifService.notif(params, config.hes_payment_uri);

        if (notified.success) {
            await this.db.payment.update({
                where: { id: payment.id },
                data: { status: 'Notified' },
            });
        }

        return notified;
    };
}
