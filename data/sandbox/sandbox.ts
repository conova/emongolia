import { UnknownObject } from '../../src/utils/types';
import WS100101 from './WS100101_getCitizenIDCardInfo';
import WS100103 from './WS100103_getCitizenAddressInfo';
import WS100202, { fail as WS100202_FAIL } from './WS100202_getPropertyList';
import WS100406, { fail as WS100406_FAIL } from './WS100406_getCitizenVehicleList';
import WS100501 from './WS100501_getCitizenSalaryInfo';
import WS100104, { fail as WS100104_FAIL } from './WS100104_getCitizenMarriageInfo';
import LIVESTOCK from './livestock';
import BUSINESS from './businessIncome';
import CIB from './cib';

const serviceMap: UnknownObject = {
    WS100101_getCitizenIDCardInfo: WS100101,
    WS100103_getCitizenAddressInfo: WS100103,
    WS100202_getPropertyList: WS100202,
    WS100202_getPropertyList_FAIL: WS100202_FAIL,
    WS100406_getCitizenVehicleList: WS100406,
    WS100406_getCitizenVehicleList_FAIL: WS100406_FAIL,
    WS100501_getCitizenSalaryInfo: WS100501,
    WS100104_getCitizenMarriageInfo: WS100104,
    WS100104_getCitizenMarriageInfo_FAIL: WS100104_FAIL,
    livestock_income: LIVESTOCK,
    business_income: BUSINESS,
    cib_data: CIB,
};

export const generate = (scope: string, unique: string) => {
    const servicesStringify = Buffer.from(scope, 'base64').toString();
    const services = JSON.parse(servicesStringify);
    const result: { [key: string]: unknown }[] = [{ citizen_loginType: 0 }];

    for (const service of services) {
        const key = <string>service.services[0];
        const data = <Record<string, Record<string, unknown>>>serviceMap[key];

        let specificData = {};
        let regnum = undefined;
        if (service.params && service.params[key].regnum) regnum = service.params[key].regnum;
        if (data instanceof Object && regnum) specificData = <UnknownObject>data[regnum];

        let returnObj = {};
        if (data.request && data.request.regnum) {
            if (unique !== data.request.regnum) {
                const plainKey = key + '_FAIL';
                const sData = <UnknownObject>serviceMap[plainKey];
                returnObj = {
                    services: {
                        [key]: {
                            ...sData,
                        },
                    },
                    wsdl: service.wsdl,
                };
            } else {
                returnObj = {
                    services: {
                        [key]: {
                            ...(regnum ? specificData : data),
                        },
                    },
                    wsdl: service.wsdl,
                };
            }
        } else {
            returnObj = {
                services: {
                    [key]: {
                        ...(regnum ? specificData : data),
                    },
                },
                wsdl: service.wsdl,
            };
        }

        result.push(returnObj);
    }

    return result;
};
