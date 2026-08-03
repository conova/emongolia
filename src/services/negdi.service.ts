import { singleton } from 'tsyringe';

import config from '../../config/config';
import Client from '../utils/client';

export interface INegdiOrder {
    tranid: string;
    checkid: string;
    status: string;
    negdiurl: string;
}

export interface INegdiOrderResponse {
    order: INegdiOrder;
    ordersign: string;
}

@singleton()
export default class NegdiService {
    private readonly _path = '/api/pay/ec1000';

    public createOrder = async (
        amount: number,
        currency: string,
        ordernum: string,
        description: string,
        ordertype: string
    ) => {
        const client = new Client(config.negdi_uri);

        const response = <INegdiOrderResponse>await client.request(Client.METHOD_POST, this._path, {
            body: {
                ordertype,
                terminalid: config.negdi_terminal_id,
                username: config.negdi_username,
                password: config.negdi_password,
                returnurl: config.negdi_return_url,
                amount,
                currency: 'MNT',
                ordernum,
                description,
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response;
    };
}
