import { container } from 'tsyringe';

import config from '../../config/config';
import logger from '../../config/logger';
import GolomtService from '../services/golomt.service';
import { runJob } from './runner';

const INTERVAL_MS = 4 * 60 * 1000;

const run = () =>
    runJob('statement', INTERVAL_MS, async () => {
        const golomtService = container.resolve(GolomtService);

        return await golomtService.statementAll();
    });

export const startStatementJob = () => {
    if (config.env === 'test') return;

    setInterval(run, INTERVAL_MS);
    run();

    logger.info('Statement job scheduled every 4 minutes');
};
