import app from './app';
import config from '../config/config';
import logger from '../config/logger';
import { startStatementJob } from './jobs/statement.job';
import { startRegisterJob } from './jobs/register.job';

const server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
    startStatementJob();
    startRegisterJob();
});

const exitHandler = () => {
    if (server) {
        server.close(() => {
            logger.info('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error: Error) => {
    logger.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) {
        server.close();
    }
});
