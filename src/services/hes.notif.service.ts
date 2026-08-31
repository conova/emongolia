import { singleton } from 'tsyringe';
import config from '../../config/config';

import logger from '../../config/logger';
import BaseException from '../exception/BaseException';
import Client from '../utils/client';
import { UnknownObject } from '../utils/types';

@singleton()
export default class HESNotifService {
    public notif = async (params: UnknownObject, uri: string) => {
        try {
            const client = new Client(uri);
            const headers: any = {
                'Content-Type': 'application/json',
                'X-Api-Key': config.hes_api_key,

            };

            await client.request(Client.METHOD_POST, '', {
                body: params,
                headers,
            });

            return {
                success: true,
                code: 0,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : <string>error;
            const code = error instanceof BaseException ? error.errorCode : -1;
            logger.error('HES response: ' + message + '::' + code);

            return {
                success: false,
                code,
            };
        }
    };
}
