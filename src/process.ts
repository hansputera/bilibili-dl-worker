import Piscina from 'piscina';
import BullMQ from 'bullmq';
import {checkDownloadArgs} from './validators/index.js';
import {getRedis} from './db/redis.js';

/**
 * Initialize the process.
 * @return {Promise<void>}
 */
export const initProcess = async (): Promise<void> => {
    const jobPool = new Piscina({
        filename: new URL('./job.js', import.meta.url).href,
        maxQueue: 'auto',
    });

    const redis = getRedis();

    new BullMQ.Worker(
        'bilibili-dl-combine',
        async (job) => {
            const valid = checkDownloadArgs(job.data);
            if (valid) {
                job.update({
                    status: 'invalid',
                    message: valid,
                });
            } else {
                jobPool.run({
                    identifier: job.data.identifier,
                    videoUrl: job.data.videoUrl,
                    audioUrl: job.data.audioUrl,
                });
            }
        },
        {
            connection: redis,
        },
    );
};
