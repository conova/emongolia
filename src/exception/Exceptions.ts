import { ErrorCode } from './ErrorCode';
import BaseException from './BaseException';

const exceptions: { [key: string]: any } = {};
ErrorCode.getExceptionList().forEach((key: string) => {
    exceptions[key] = class extends BaseException {
        constructor(message = undefined, code = undefined) {
            super(message, code, key);
        }
    };
});

export default exceptions;
