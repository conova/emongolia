import { Request } from 'express';
import { UnknownObject } from './types';

/**
 * Create an object composed of the picked object properties
 * @param {Object} object
 * @param {string[]} keys
 * @returns {Object}
 */
const pick = (object: UnknownObject | Request, keys: string[]) => {
    const k = object as UnknownObject;
    return keys.reduce((obj: UnknownObject, key: string) => {
        if (k && Object.prototype.hasOwnProperty.call(k, key)) {
            obj[key] = k[key];
        }
        return obj;
    }, {});
};

export default pick;
