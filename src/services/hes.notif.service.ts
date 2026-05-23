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
            let headers: any = {
                'Content-Type': 'application/json',
                'X-Api-Key': config.hes_api_key,
            };

            if (uri.toLowerCase().includes('uat-integration')) {
                headers = {
                    'Content-Type': 'application/json',
                    'X-Api-Key': 'be332f69-4804-40fd-92df-92b1f426df2a',
                };
            }

            const response = await client.request(Client.METHOD_POST, '', {
                body: params,
                headers,
            });

            if (JSON.stringify(response).includes('Regnum is not matched')) {
                return {
                    success: false,
                    code: 1008,
                };
            }

            if (JSON.stringify(response).includes('Customer with this regnum already exists')) {
                return {
                    success: false,
                    code: 1010,
                };
            }

            if (
                response.some(
                    (item: any) =>
                        item.serviceDataType === 'CITIZEN_ID_CARD_INFO' && item.message === 'Response is empty'
                )
            ) {
                return {
                    success: false,
                    code: 1010,
                };
            }

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
