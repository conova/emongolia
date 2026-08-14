import { container } from 'tsyringe';

import config from '../../config/config';
import logger from '../../config/logger';
import GolomtService from '../services/golomt.service';
import { runJob } from './runner';

const INTERVAL_MS = 2 * 60 * 1000;

const run = () =>
    runJob('register', INTERVAL_MS, async () => {
        const golomtService = container.resolve(GolomtService);

        return await golomtService.registerTransactions();
    });

export const startRegisterJob = () => {
    if (config.env === 'test') return;

    if (!config.hes_transaction_uri) {
        logger.warn('Register job disabled: HES_TRANSACTION_URI is not set');
        return;
    }

    setInterval(run, INTERVAL_MS);
    run();

    logger.info('Register job scheduled every 2 minutes');
};
