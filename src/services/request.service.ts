import { autoInjectable } from 'tsyringe';
import { Prisma, PrismaClient, SERVICES } from '@prisma/client';

import fs from 'fs';
import { join } from 'path';

import prisma from '../utils/prisma';
import BaseException from '../exception/BaseException';
import exceptions from '../exception/Exceptions';

export interface IRequestService {
    code: SERVICES;
    params?: Record<string, unknown>;
}

@autoInjectable()
export class RequestService {
    private path = join(__dirname, '..', '..', 'responseLog');

    private readonly db: PrismaClient;

    constructor() {
        this.db = prisma;
    }

    public create = async (requestData: Prisma.requestCreateInput) =>
        await this.db.request.create({
            data: requestData,
        });

    public updateRequestById = async (id: number, data: Prisma.requestUpdateInput) => {
        try {
            return await this.db.request.update({ where: { id }, data });
        } catch (error) {
            const message = error instanceof Error ? error.message : <string>error;

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                throw new BaseException(`Unhandled prisma client exception: ${message}`);
            }

            throw new BaseException(`Unhandled exception: ${message}`);
        }
    };

    public getRequestById = async (id: number) => {
        return await this.db.request.findUnique({ where: { id } });
    };

    public getRequestByState = async (state: string) => {
        return await this.db.request.findUnique({ where: { state } });
    };

    public getRequestWithResponse = async (id: number, state: string) => {
        const request = await this.db.request.findUnique({ where: { id } });

        if (!request) throw new exceptions.RequestNotFoundException();

        if (request.state !== state) throw new exceptions.StateIsNotSameException();

        let response = '';
        const file = this.path + '/' + request.state + '.json';
        if (fs.existsSync(file)) {
            response = JSON.parse(fs.readFileSync(file, 'utf8'));
        }

        return {
            id: request.id,
            unique: request.unique,
            status: request.status,
            services: request.services,
            response,
        };
    };
}
