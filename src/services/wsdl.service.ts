import { Prisma, PrismaClient, SERVICES, STATUS_SERVICES } from '@prisma/client';
import { inject, singleton } from 'tsyringe';

import { UnknownObject } from '../utils/types';
import BaseException from '../exception/BaseException';
import logger from '../../config/logger';

export interface IService {
    id: string;
    code: string;
    key: string;
    wsdl: string;
    params: string;
    status: string;
}

@singleton()
export default class WsdlService {
    private readonly db: PrismaClient;

    private IServicesSelect = {
        id: true,
        code: true,
        key: true,
        desc: true,
        wsdl: true,
        params: true,
        status: true,
    };

    constructor(@inject('PrismaClient') prisma: PrismaClient) {
        this.db = prisma;
    }

    getServiceList = async (status?: STATUS_SERVICES) => {
        let where = {};
        if (undefined !== status) where = { status };

        return await this.db.services.findMany({
            select: this.IServicesSelect,
            where,
        });
    };

    getServiceByCode = async (code: SERVICES): Promise<UnknownObject | null> => {
        return await this.db.services.findUnique({
            select: this.IServicesSelect,
            where: { code },
        });
    };

    getServiceByKey = async (key: string): Promise<UnknownObject | null> => {
        return await this.db.services.findUnique({
            select: this.IServicesSelect,
            where: { key },
        });
    };

    insertService = async (
        code: SERVICES,
        key: string,
        desc: string,
        wsdl: string | undefined | null,
        params: string
    ) => {
        try {
            return await this.db.services.create({
                data: { code, key, desc, wsdl, params },
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : <string>error;
            logger.error(this.constructor.name + ':' + message);
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') throw new BaseException(`Already created service exception: ${code}`);
                throw new BaseException('Unhandled prisma request exception');
            }
            if (error instanceof Prisma.PrismaClientValidationError) {
                throw new BaseException('Unhandled prisma validation exception');
            }
            throw new BaseException('Unhandled prisma exception');
        }
    };

    updateService = async (code: SERVICES, data: Prisma.servicesUpdateInput) => {
        try {
            return await this.db.services.update({
                where: { code },
                data: {
                    key: data.key || undefined,
                    wsdl: data.wsdl || undefined,
                    params: data.params || undefined,
                    status: data.status,
                },
            });
        } catch (error) {
            throw new BaseException('Service not found!');
        }
    };
}
