import { container } from 'tsyringe';
import { PrismaClient, STATUS_JOB } from '@prisma/client';

import logger from '../../config/logger';
import { UnknownObject } from '../utils/types';

/// records every run in job_run; skips the tick while the previous run is
/// unfinished, and marks a run FAILED once it outlives 3 intervals
export const runJob = async (name: string, intervalMs: number, fn: () => Promise<unknown>) => {
    const db = container.resolve<PrismaClient>('PrismaClient');

    const previous = await db.job_run.findFirst({
        where: { name, status: STATUS_JOB.RUNNING },
        orderBy: { id: 'desc' },
    });

    if (previous) {
        if (Date.now() - previous.startedAt.getTime() < intervalMs * 3) {
            logger.info('Job ' + name + ': previous run still in progress, skipping');
            return;
        }

        await db.job_run.update({
            where: { id: previous.id },
            data: {
                status: STATUS_JOB.FAILED,
                finishedAt: new Date(),
                error: 'Timed out: did not finish within 3 intervals',
            },
        });
        logger.error('Job ' + name + ': run #' + previous.id + ' timed out, marked FAILED');
    }

    const run = await db.job_run.create({ data: { name } });

    try {
        const result = await fn();

        await db.job_run.update({
            where: { id: run.id },
            data: {
                status: STATUS_JOB.DONE,
                finishedAt: new Date(),
                result: <UnknownObject>(<unknown>(result ?? {})),
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : <string>error;
        logger.error('Job ' + name + ' failed: ' + message);

        await db.job_run.update({
            where: { id: run.id },
            data: { status: STATUS_JOB.FAILED, finishedAt: new Date(), error: message },
        });
    }
};
