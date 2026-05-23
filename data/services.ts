import 'reflect-metadata';

import { SERVICES, STATUS_SERVICES } from '@prisma/client';

const citizen = 'https://xyp.gov.mn/citizen-1.3.0/ws?WSDL';
const property = 'https://xyp.gov.mn/property-1.3.0/ws?WSDL';
const legalEntity = 'https://xyp.gov.mn/legal-entity-1.3.0/ws?WSDL';
const transport = 'https://xyp.gov.mn/transport-1.3.0/ws?WSDL';
const insurance = 'https://xyp.gov.mn/insurance-1.3.0/ws?WSDL';
const tax = 'https://xyp.gov.mn/tax-1.3.0/ws?WSDL';

export const services = [
    {
        key: 'WS100101_getCitizenIDCardInfo',
        code: SERVICES.CITIZEN_ID_CARD_INFO,
        wsdl: citizen,
        desc: 'Иргэний үнэмлэхний мэдээлэл дамжуулах сервис',
        params: [],
        status: STATUS_SERVICES.ACTIVE,
    },
    {
        key: 'WS100102_getCitizenBirthInfo',
        code: SERVICES.CITIZEN_BIRTH_INFO,
        wsdl: citizen,
        desc: 'Иргэний төрсний гэрчилгээний мэдээлэл дамжуулах сервис',
        params: [],
        status: STATUS_SERVICES.INACTIVE,
    },
    {
        key: 'WS100103_getCitizenAddressInfo',
        code: SERVICES.CITIZEN_ADDRESS_INFO,
        wsdl: citizen,
        desc: 'Иргэний хаягийн мэдээлэл дамжуулах сервис',
        params: [],
        status: STATUS_SERVICES.ACTIVE,
    },
    {
        key: 'WS100104_getCitizenMarriageInfo',
        code: SERVICES.CITIZEN_MARRIAGE_INFO,
        wsdl: citizen,
        desc: 'Иргэн гэрлэлтийн мэдээлэл дамжуулах сервис',
        params: [],
        status: STATUS_SERVICES.ACTIVE,
    },
    {
        key: 'WS100105_getCitizenMarriageDivorceInfo',
        code: SERVICES.CITIZEN_MARRIAGE_DIVORCE_INFO,
        wsdl: citizen,
        desc: 'Иргэн гэрлэлт цуцалсан тухай мэдээлэл дамжуулах сервис',
        params: [],
        status: STATUS_SERVICES.ACTIVE,
    },
    {
        key: 'WS100106_authorizeCitizen',
        code: SERVICES.AUTHORIZE_CITIZEN,
        wsdl: citizen,
        desc: 'Иргэнийг хурууны хээгээр баталгаажуулах сервис',
        params: [],
        status: STATUS_SERVICES.INACTIVE,
    },
    {
        key: 'WS100107_checkCitizenInfo',
        code: SERVICES.CITIZEN_INFO,
        wsdl: citizen,
        desc: 'Иргэний мэдээлэл тулгах сервис',
        params: [
            {
                param: 'firstName',
                desc: 'Иргэний нэр',
                type: 'string',
            },
            {
                param: 'lastName',
                desc: 'Иргэний овог',
                type: 'string',
            },
        ],
        status: STATUS_SERVICES.ACTIVE,
    },
    {
        key: 'WS100125_checkCitizenRegnum',
        code: SERVICES.CHECK_CITIZEN_REGNUM,
        wsdl: citizen,
        desc: 'Иргэний регистрийн дугаар үнэн эсэхийг шалгах сервис',
        params: [],
        status: STATUS_SERVICES.ACTIVE,
    },
    {
        key: 'WS100128_getCitizenNoMarriegeInfo',
        code: SERVICES.CITIZEN_NO_MARRIEGE_INFO,
        wsdl: citizen,
        desc: 'Гэрлэлт бүртгэлгүй тухай мэдээлэл дамжуулах сервис',
        params: [],
        status: STATUS_SERVICES.ACTIVE,
    },
    {
        key: 'WS100201_getPropertyInfo',
        code: SERVICES.PROPERTY_INFO,
        wsdl: property,
        desc: 'Үл хөдлөх хөрөнгийн мэдээлэл дамжуулах сервис',
        params: [
            {
                param: 'propertyNumber',
                desc: 'Үл хөдлөхийн дугаар',
                type: 'string',
            },
        ],
        status: STATUS_SERVICES.ACTIVE,
    },
    {
        key: 'WS100202_getPropertyList',
        code: SERVICES.PROPERTY_LIST,
        wsdl: property,
        desc: 'Үл хөдлөх хөрөнгийн жагсаалт авах сервис',
        params: [],
        status: STATUS_SERVICES.ACTIVE,
    },
    {
        key: 'WS100307_getLegalEntityInfoWithRegnum',
        code: SERVICES.LEGAL_ENTITY_INFO_WITH_REGNUM,
        wsdl: legalEntity,
        desc: 'Хуулийн этгээдийн мэдээлэл дамжуулах сервис',
        params: [
            {
                param: 'legalEntityNumber',
                desc: 'Байгууллагын регистрийн дугаар',
                type: 'int',
            },
        ],
        status: STATUS_SERVICES.ACTIVE,
    },
    {
        key: 'WS100401_getVehicleInfo',
        code: SERVICES.VEHICLE_INFO_OLD,
        wsdl: transport,
        desc: 'Тээврийн хэрэгслийн мэдээлэл дамжуулах сервис',
        params: [
            {
                param: 'plateNumber',
                desc: 'Улсын дугаар',
                type: 'string',
            },
            {
                param: 'cabinNumber',
                desc: 'Арлын дугаар',
                type: 'int',
            },
        ],
        status: STATUS_SERVICES.ACTIVE,
    },
    {
        key: 'WS100402_getVehicleOwnerHistoryList',
        code: SERVICES.VEHICLE_OWNER_HISTORY_LIST,
        wsdl: transport,
        desc: 'Тээврийн хэрэгслийн эзэмшигчийн түүхчилсэн мэдээлэл дамжуулах сервис',
        params: [
            {
                param: 'cabinNumber',
                desc: 'Арлын дугаар',
                type: 'string',
            },
        ],
        status: STATUS_SERVICES.ACTIVE,
    },
    {
        key: 'WS100403_getVehiclePenaltyList',
        code: SERVICES.VEHICLE_PENALTY_LIST,
        wsdl: transport,
        desc: 'Тээврийн хэрэгслийн торгуулийн мэдээлэл дамжуулах сервис',
        params: [
            {
                param: 'plateNumber',
                desc: 'Улсын дугаар',
                type: 'string',
            },
        ],
        status: STATUS_SERVICES.INACTIVE,
    },
    {
        key: 'WS100406_getCitizenVehicleList',
        code: SERVICES.CITIZEN_VEHICLE_LIST,
        wsdl: transport,
        desc: 'Иргэний тээврийн хэрэгслийн мэдээлэл дамжуулах сервис',
        params: [],
        status: STATUS_SERVICES.ACTIVE,
    },
    {
        key: 'WS100407_getDriverLicenseInfo',
        code: SERVICES.DRIVER_LICENSE_INFO,
        wsdl: transport,
        desc: 'Иргэний тээврийн хэрэгслийн мэдээлэл дамжуулах сервис',
        params: [],
        status: STATUS_SERVICES.ACTIVE,
    },
    {
        key: 'WS100501_getCitizenSalaryInfo',
        code: SERVICES.SALARY_INCOME,
        wsdl: insurance,
        desc: 'Иргэний нийгмийн даатгалын мэдээлэл дамжуулах сервис',
        params: [
            {
                param: 'endYear',
                desc: 'Дууссан жил',
                type: 'int',
            },
            {
                param: 'startYear',
                desc: 'Эхэлсэн жил',
                type: 'int',
            },
        ],
        status: STATUS_SERVICES.ACTIVE,
    },
    {
        key: 'WS100502_getCitizenPensionInquiry',
        code: SERVICES.CITIZEN_PENSION_INQUIRY,
        wsdl: insurance,
        desc: 'Тэтгэврийн лавлагааны мэдээлэл дамжуулах сервис',
        params: [
            {
                param: 'startYear',
                desc: 'Эхэлсэн жил',
                type: 'int',
            },
            {
                param: 'endYear',
                desc: 'Дууссан жил',
                type: 'int',
            },
        ],
        status: STATUS_SERVICES.ACTIVE,
    },
    {
        key: 'WS100601_getTaxPayerInfo',
        code: SERVICES.TAX_PAYER_INFO,
        wsdl: tax,
        desc: 'Татвар төлөгчийн мэдээлэл дамжуулах сервис',
        params: [
            {
                param: 'dedication',
                desc: 'Зориулалт',
                type: 'string',
            },
            {
                param: 'year',
                desc: 'Он',
                type: 'string',
            },
            {
                param: 'documentResponse',
                desc: 'Албан бичгийн хариу',
                type: 'string',
            },
            {
                param: 'dedicationOrg',
                desc: 'Хаана зориулж',
                type: 'string',
            },
            {
                param: 'orgId',
                desc: 'Сервис дуудаж буй байгуулагын Татварын ерөнхий газар дээр бүртгэлтэй дугаар',
                type: 'string',
            },
            {
                param: 'tin',
                desc: 'Татвар төлөгчийн регистрийн дугаар',
                type: 'string',
            },
        ],
        status: STATUS_SERVICES.ACTIVE,
    },
    {
        key: 'WS100609_getVehiclePaidTaxHistory',
        code: SERVICES.VEHICLE_PAID_TAX_HISTORY,
        wsdl: tax,
        desc: 'Тээврийн хэрэгслийн төлбөр төлсөн нэхэмжлэлийн түүхийг харуулах',
        params: [
            {
                param: 'plateNumber',
                desc: 'Тээврийн хэрэгслийн улсын дугаар',
                type: 'string',
            },
        ],
        status: STATUS_SERVICES.ACTIVE,
    },
    {
        key: 'WS100610_getVehicleTaxPayableInfo',
        code: SERVICES.VEHICLE_TAX_PAYABLE_INFO,
        wsdl: tax,
        desc: 'Тээврийн хэрэгслийн төлбөр төлсөн нэхэмжлэлийн түүхийг харуулах',
        params: [
            {
                param: 'plateNumber',
                desc: 'Тээврийн хэрэгслийн улсын дугаар',
                type: 'string',
            },
        ],
        status: STATUS_SERVICES.ACTIVE,
    },
    {
        key: 'WS100611_getVehicleInfo',
        code: SERVICES.VEHICLE_INFO,
        wsdl: tax,
        desc: 'Тээврийн хэрэгслийн мэдээлэл дамжуулах сервис',
        params: [
            {
                param: 'plateNumber',
                desc: 'Тээврийн хэрэгслийн улсын дугаар',
                type: 'string',
            },
        ],
        status: STATUS_SERVICES.ACTIVE,
    },
];
