import { PrismaClient } from '@prisma/client';
import logger from '../../config/logger';

const prisma = new PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'stdout',
            level: 'error',
        },
        {
            emit: 'stdout',
            level: 'info',
        },
        {
            emit: 'stdout',
            level: 'warn',
        },
    ],
});

prisma.$on('query', (e) => {
    logger.log('info', e.query);
});

export default prisma;
