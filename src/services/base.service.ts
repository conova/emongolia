import { autoInjectable, inject } from 'tsyringe';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { join } from 'path';

import HESNotifService from './hes.notif.service';
import WsdlService from './wsdl.service';
import { UnknownObject } from '../utils/types';
import logger from '../../config/logger';

export interface IEMongoliaServiceStructure {
    services: string[];
    wsdl: string;
    params?: Record<string, unknown>;
}

@autoInjectable()
export default class BaseService {
    protected readonly hesNotifService: HESNotifService;
    protected readonly wsdlService: WsdlService;
    protected readonly db: PrismaClient;
    protected path;

    constructor(
        hesNotifService: HESNotifService,
        wsdlService: WsdlService,
        @inject('PrismaClient') prisma: PrismaClient
    ) {
        this.hesNotifService = hesNotifService;
        this.wsdlService = wsdlService;
        this.db = prisma;
        this.path = join(__dirname, '..', '..', 'responseLog');
    }

    protected logToFile = async (state: string, content: UnknownObject) => {
        try {
            if (!fs.existsSync(this.path)) await fs.mkdirSync(this.path);

            const file = this.path + '/' + state + '.json';

            await fs.writeFileSync(file, JSON.stringify(content));
        } catch (error) {
            let message = <string>error;
            if (error instanceof Error) message = error.message;

            logger.error(this.constructor.name + '::' + 'error while write to file' + '::' + message);
        }
    };
}
