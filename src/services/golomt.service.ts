import { inject, singleton } from 'tsyringe';
import { PrismaClient, STATUS_TRANSACTION, STATUS_WITHDRAW } from '@prisma/client';
import crypto from 'crypto';

import config from '../../config/config';
import logger from '../../config/logger';
import BaseException from '../exception/BaseException';
import { stateGenerator } from '../utils/utils';
import { UnknownObject } from '../utils/types';
import GolomtClient, { GOLOMT_SERVICE } from './golomt.client';
import HESNotifService from './hes.notif.service';

export interface IWithdrawInput {
    custid?: string;
    registerNumber?: string;
    type: string;
    acctName: string;
    acctNo: string;
    bank: string;
    amount: number;
    currency: string;
    description?: string;
}

export interface IAccountInput {
    type: string;
    bank: string;
    account: string;
    name: string;
    currency: string;
    statement: boolean;
}

@singleton()
export default class GolomtService {
    private readonly golomtClient: GolomtClient;
    private readonly hesNotifService: HESNotifService;
    private readonly db: PrismaClient;

    constructor(
        golomtClient: GolomtClient,
        hesNotifService: HESNotifService,
        @inject('PrismaClient') prisma: PrismaClient
    ) {
        this.golomtClient = golomtClient;
        this.hesNotifService = hesNotifService;
        this.db = prisma;
    }

    public withdraw = async (input: IWithdrawInput) => {
        // the initiator account is selected by its type
        const account = await this.db.bank_account.findUnique({ where: { type: input.type } });
        if (!account) throw new BaseException('Unknown account type: ' + input.type, 2004);

        // step 1: save the request
        let withdraw = await this.db.withdraw.create({
            data: {
                custid: input.custid,
                acctType: input.type,
                registerNumber: input.registerNumber,
                acctName: input.acctName,
                acctNo: input.acctNo,
                bank: input.bank,
                amount: input.amount,
                currency: input.currency,
                description: input.description,
            },
        });

        const particulars = input.description ?? `withdraw ${withdraw.id}`;

        // step 2: transfer
        let transfer: UnknownObject;
        try {
            const body = {
                genericType: null,
                registerNumber: input.registerNumber ?? null,
                type: 'TSF',
                refCode: String(withdraw.id),
                initiator: {
                    genericType: null,
                    acctName: account.name,
                    acctNo: account.account,
                    amount: { value: input.amount, currency: input.currency },
                    particulars,
                    bank: account.bank,
                },
                receives: [
                    {
                        genericType: null,
                        acctName: input.acctName,
                        acctNo: input.acctNo,
                        amount: { value: input.amount, currency: input.currency },
                        particulars,
                        bank: input.bank,
                    },
                ],
                remarks: particulars,
            };

            transfer = await this.golomtClient.request(GOLOMT_SERVICE.TRANSFER, '/v1/transaction/cgw/transfer', body, {
                query: {
                    client_id: config.golomt_client_id,
                    state: await stateGenerator(String(withdraw.id)),
                    scope: config.golomt_scope,
                },
                withGolomtCode: true,
            });
        } catch (error) {
            return await this.fail(withdraw.id, STATUS_WITHDRAW.TRANSFER_FAILED, error);
        }

        withdraw = await this.db.withdraw.update({
            where: { id: withdraw.id },
            data: {
                status: STATUS_WITHDRAW.TRANSFERRED,
                clientId: <string>transfer?.clientId,
                state: <string>transfer?.state,
                scope: <string>transfer?.scope,
                transferRes: <UnknownObject>transfer,
            },
        });

        // step 3: confirm the transaction
        // try {
        //     const confirm = await this.golomtClient.request(GOLOMT_SERVICE.CONFIRM, '/v1/transaction/confirm', {
        //         clientId: withdraw.clientId,
        //         scope: withdraw.scope,
        //         state: withdraw.state,
        //         type: 'INB',
        //     });
        //
        //     withdraw = await this.db.withdraw.update({
        //         where: { id: withdraw.id },
        //         data: { status: STATUS_WITHDRAW.CONFIRMED, confirmRes: <UnknownObject>confirm },
        //     });
        // } catch (error) {
        //     return await this.fail(withdraw.id, STATUS_WITHDRAW.CONFIRM_FAILED, error);
        // }

        return withdraw;
    };

    public statement = async (accountId: string, startDate: string, endDate: string) => {
        const response = await this.golomtClient.request(
            GOLOMT_SERVICE.STATEMENT,
            '/v1/account/operative/statement',
            {
                registerNo: config.golomt_register_no,
                accountId,
                startDate,
                endDate,
            },
            {
                query: {
                    client_id: config.golomt_client_id,
                    state: await stateGenerator(accountId),
                    scope: config.golomt_scope,
                },
            }
        );

        const records = this.extractRecords(response);

        // only newly arrived transactions are inserted — the hash makes re-fetches idempotent
        const result = await this.db.bank_transaction.createMany({
            data: records.map((record) => ({
                accountId,
                hash: crypto
                    .createHash('sha256')
                    .update(accountId + JSON.stringify(record))
                    .digest('hex'),
                tranId: this.asString(record.tranId ?? record.refno),
                tranDate: this.asString(record.tranDate ?? record.date),
                tranPostedDate: this.asString(record.tranPostedDate),
                currency: this.asString(record.currency ?? record.tranCrnCode),
                amount: this.asNumber(record.amount ?? record.tranAmount),
                balance: this.asNumber(record.balance),
                drOrCr: this.asString(record.drOrCr),
                relatedAccount: this.asString(
                    record.accNum ?? record.relatedAccount ?? record.contraAccount ?? record.accountNo
                ),
                accName: this.asString(record.accName ?? record.acctName),
                branchId: this.asString(record.branchId ?? record.txnBranchId),
                tellerId: this.asString(record.tellerId),
                journalNo: this.asString(record.journalNo),
                exchRate: this.asNumber(record.exchRate),
                description: this.asString(record.description ?? record.particulars ?? record.tranDesc),
                record,
            })),
            skipDuplicates: true,
        });

        logger.info('Golomt statement ' + accountId + ': ' + records.length + ' records, ' + result.count + ' new');

        return { total: records.length, saved: result.count, statements: records };
    };

    /// exchange rate straight from Golomt, no persistence
    public rate = async (currency: string) => {
        return await this.golomtClient.request(GOLOMT_SERVICE.RATE, '/v1/utility/rate/inq', { currency });
    };

    /// fetches statements for every account flagged with statement = true
    public statementAll = async () => {
        const accounts = await this.db.bank_account.findMany({ where: { statement: true } });

        const end = new Date();
        const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);

        const results = [];
        for (const account of accounts) {
            try {
                const result = await this.statement(account.account, this.formatDate(start), this.formatDate(end));
                results.push({ account: account.account, total: result.total, saved: result.saved });
            } catch (error) {
                const message = error instanceof Error ? error.message : <string>error;
                logger.error('Golomt statement ' + account.account + ' failed: ' + message);
                results.push({ account: account.account, error: message });
            }
        }

        return results;
    };

    public saveAccount = async (input: IAccountInput) => {
        return await this.db.bank_account.upsert({
            where: { type: input.type },
            update: input,
            create: input,
        });
    };

    public accounts = async () => {
        return await this.db.bank_account.findMany({ orderBy: { id: 'asc' } });
    };

    /// sends transactions not yet registered in the HES core system, in one batch
    public registerTransactions = async () => {
        if (!config.hes_transaction_uri) return { total: 0, sent: 0 };

        const pending = await this.db.bank_transaction.findMany({
            where: { status: STATUS_TRANSACTION.PENDING },
            orderBy: { id: 'asc' },
            take: 100,
        });

        if (pending.length === 0) return { total: 0, sent: 0 };

        // the raw bank record as-is, id overridden with the gateway id
        const payload = pending.map((txn) => ({
            ...(<UnknownObject>txn.record),
            id: txn.id,
        }));

        const notified = await this.hesNotifService.notif(
            <UnknownObject>(<unknown>payload),
            config.hes_transaction_uri
        );

        if (notified.success) {
            await this.db.bank_transaction.updateMany({
                where: { id: { in: pending.map((txn) => txn.id) } },
                data: { status: STATUS_TRANSACTION.REGISTERED },
            });
        }

        return { total: pending.length, sent: notified.success ? pending.length : 0, code: notified.code };
    };

    private fail = async (id: number, status: STATUS_WITHDRAW, error: unknown) => {
        const message = error instanceof Error ? error.message : <string>error;
        logger.error('Golomt withdraw ' + id + ' ' + status + ': ' + message);

        return await this.db.withdraw.update({
            where: { id },
            data: { status, error: message },
        });
    };

    private asString = (value: unknown): string | null => (value === null || value === undefined ? null : String(value));

    private asNumber = (value: unknown): number | null => {
        if (value === null || value === undefined || value === '') return null;

        const parsed = Number(value);
        return isNaN(parsed) ? null : parsed;
    };

    private formatDate = (date: Date) => {
        const pad = (n: number) => String(n).padStart(2, '0');

        return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
    };

    private extractRecords = (response: unknown): UnknownObject[] => {
        if (Array.isArray(response)) return response;

        if (response && typeof response === 'object') {
            for (const value of Object.values(response)) {
                if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object')
                    return <UnknownObject[]>value;
            }
        }

        return [];
    };
}
