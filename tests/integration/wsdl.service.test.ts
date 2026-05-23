import 'reflect-metadata';
import setupTestDB, { prisma } from '../utils/setupTestDB';

import { Prisma, SERVICES, STATUS_SERVICES } from '@prisma/client';
import { WsdlService } from '../../src/services';
import BaseException from '../../src/exception/BaseException';

describe('WSDL service', () => {
    setupTestDB();

    const services = [
        { key: 'WST_00001', code: SERVICES.CITIZEN_INFO, desc: 'name1', wsdl: 'https://xyp.mn/wsdl.v.1.0', params: {} },
        {
            key: 'WST_00002',
            code: SERVICES.PROPERTY_INFO,
            desc: 'name2',
            wsdl: 'https://xyp.mn/wsdl.v.1.0',
            params: { param1: { type: 'string', desc: 'desc' } },
        },
        {
            key: 'WST_00003',
            code: SERVICES.CITIZEN_ADDRESS_INFO,
            desc: 'name3',
            wsdl: 'https://xyp.mn/wsdl.v.1.0',
            params: {},
        },
    ];

    let wsdlService: WsdlService;
    beforeAll(async () => {
        wsdlService = new WsdlService(prisma);

        for (const { code, key, desc, wsdl, params } of services) {
            await wsdlService.insertService(code, key, desc, wsdl, <string>params);
        }
    });

    afterEach(async () => {
        jest.restoreAllMocks();
    });

    describe('Create Service', () => {
        const testService: Prisma.servicesCreateInput = {
            code: SERVICES.VEHICLE_INFO_OLD,
            key: 'WST_000000VEHICLE',
            desc: 'Тест сервисэ',
            wsdl: 'https://wsdl.test.mn?query=xypv1.3.0',
            status: STATUS_SERVICES.ACTIVE,
            params: [
                {
                    param: 'param1',
                    desc: 'test',
                    type: 'string',
                },
                {
                    param: 'param2',
                    desc: 'test1',
                    type: 'int',
                },
            ],
        };

        afterAll(async () => {
            await prisma.services.delete({ where: { code: testService.code } });
        });

        test('it should create service', async () => {
            expect(await prisma.services.count()).toBe(3);

            await wsdlService.insertService(
                testService.code,
                testService.key,
                testService.desc,
                testService.wsdl,
                <string>testService.params
            );

            expect(await prisma.services.count()).toBe(4);
            const service = await prisma.services.findUnique({ where: { code: testService.code } });

            expect(service?.key).toEqual(testService.key);
            expect(service?.code).toEqual(testService.code);
            expect(service?.desc).toEqual(testService.desc);
            expect(service?.status).toEqual(STATUS_SERVICES.ACTIVE);
        });

        test('it should throw duplicated service exception', async () => {
            expect(await prisma.services.count()).toBe(4);

            try {
                await wsdlService.insertService(
                    testService.code,
                    testService.key,
                    testService.desc,
                    testService.wsdl,
                    <string>testService.params
                );
            } catch (error) {
                expect(error).toBeInstanceOf(BaseException);
                expect(error).toHaveProperty('message', `Already created service exception: ${testService.code}`);
            }
        });
    });

    describe('Get Service', () => {
        test('it should return list of service', async () => {
            expect(await prisma.services.count()).toBe(services.length);

            const list = await wsdlService.getServiceList();

            for (const item of list) {
                const expectedService = services
                    .filter((service) => service.code === item.code)
                    .reduce((obj, service) => (obj = service), {});

                expect({
                    code: item.code,
                    key: item.key,
                    desc: item.desc,
                    wsdl: item.wsdl,
                    params: item.params,
                }).toStrictEqual(expectedService);
            }
        });

        test('it should return only active list of service', async () => {
            expect(await prisma.services.count()).toBe(services.length);

            await wsdlService.updateService(services[0].code, { status: STATUS_SERVICES.INACTIVE });

            const list = await wsdlService.getServiceList(STATUS_SERVICES.ACTIVE);

            expect(list.length).toBe(services.length - 1);

            for (let i = 1; i < list.length; i++) {
                expect(list[i].status).toBe(STATUS_SERVICES.ACTIVE);
            }
        });
    });
});
