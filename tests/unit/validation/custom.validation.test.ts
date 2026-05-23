import Joi from 'joi';
import { isNumber, password } from '../../../src/validations/custom.validation';

describe('Validation test', () => {
    test('valid number', () => {
        const numbers = [1, 2, 3];

        numbers.forEach((number) => {
            const { value, error } = Joi.compile({
                number: Joi.number().custom(isNumber),
            }).validate({ number });

            expect(value).toStrictEqual({ number });
            expect(error).toBeUndefined();
        });
    });

    test('valid number but string', () => {
        const numbers = ['11001', '23', '3'];

        numbers.forEach((number) => {
            const { value, error } = Joi.compile({
                number: Joi.number().custom(isNumber),
            }).validate({ number });

            expect(value).toStrictEqual({ number: parseInt(number) });
            expect(error).toBeUndefined();
        });
    });

    test('not valid number', () => {
        const numbers = ['one', 'ac@', '$', '12twelve'];

        numbers.forEach((number) => {
            const { value, error } = Joi.compile({
                number: Joi.number().custom(isNumber),
            }).validate({ number: number });

            expect(value).toStrictEqual({ number });
            expect(error?.message).toBe('"number" must be a number');
        });
    });

    test('valid password', () => {
        const { value, error } = Joi.compile({
            password: Joi.string().custom(password),
        }).validate({ password: 'password123' });

        expect(value).toStrictEqual({ password: 'password123' });
        expect(error).toBeUndefined();
    });

    test('not valid password return length error', () => {
        const { value, error } = Joi.compile({
            password: Joi.string().custom(password),
        }).validate({ password: 'passwor' });

        expect(value).toStrictEqual({ password: 'passwor' });
        expect(error?.message).toBe('password must be at least 8 characters');
    });

    test('not valid password', () => {
        const { value, error } = Joi.compile({
            password: Joi.string().custom(password),
        }).validate({ password: 'abcdefgh' });

        expect(value).toStrictEqual({ password: 'abcdefgh' });
        expect(error?.message).toBe('password must contain at least 1 letter and 1 number');
    });
});
