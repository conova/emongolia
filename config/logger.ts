import winston from 'winston';
import config from './config';

const enumerateErrorFormat = winston.format((info) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info.stack });
    }
    return info;
});

const logger = winston.createLogger({
    level: config.env === 'dev' ? 'debug' : 'info',
    format: winston.format.combine(
        enumerateErrorFormat(),
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.splat(),
        winston.format.printf((info) => {
            const { timestamp, level, message, ...args } = info;

            return `[${timestamp}] ${level}: ${message} ${
                Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
            }`;
        })
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize({ all: config.env === 'dev' ? true : false })),
            stderrLevels: ['error'],
        }),
        new winston.transports.File({ filename: 'log/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'log/combined.log' }),
    ],
});

export default logger;
