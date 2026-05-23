import 'reflect-metadata';

import { container } from 'tsyringe';
import setupTestDB from '../utils/setupTestDB';

import HESNotifService from '../../src/services/hes.notif.service';
import { UnknownObject } from '../../src/utils/types';

jest.mock('node-fetch');
import fetch from 'node-fetch';
const { Response } = jest.requireActual('node-fetch');

const setResponseToFetch = (expected: UnknownObject | string | number, options: UnknownObject = {}) =>
    (fetch as jest.MockedFunction<typeof fetch>).mockReturnValueOnce(new Response(JSON.stringify(expected), options));

describe('HES notif service', () => {
    setupTestDB();

    const hesNotifService = container.resolve(HESNotifService);

    test('it should notif to hes', async () => {
        setResponseToFetch({}, { status: 200 });

        const res = await hesNotifService.notif({}, 'uri');

        expect(res).toBeTruthy();
    });

    test('it should throw error', async () => {
        setResponseToFetch({ code: 1, response: 'Failed' }, { status: 400 });

        const res = await hesNotifService.notif({}, 'uri');

        expect(res).toBeFalsy();
    });
});
