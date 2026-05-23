interface IException {
    code: number;
    message: string;
}
class ErrorCode {
    static InvalidParamException: IException = {
        code: 1001,
        message: 'Invalid parameter',
    };

    static ServiceNotFoundException: IException = {
        code: 1002,
        message: 'Service not found',
    };

    static RequiredParamMissingException: IException = {
        code: 1003,
        message: 'Required parameter missing',
    };

    static RequestNotFoundException: IException = {
        code: 1004,
        message: 'Request not found',
    };

    static StateIsNotSameException: IException = {
        code: 1005,
        message: 'State is not same',
    };

    static getExceptionList = () =>
        Object.keys(ErrorCode).filter((value) => value.substring(value.length - 9) == 'Exception');
}

export { ErrorCode, IException };
