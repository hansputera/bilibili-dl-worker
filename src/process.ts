import {getRedis} from './db/redis.js';
import {WorkerManager} from './workers/manager.js';
import {streamWorker} from './worker_list/stream.js';

/**
 * Initialize the process.
 * @return {Promise<void>}
 */
export const initProcess = async (): Promise<void> => {
    console.log('Initializing redis...');
    const redis = getRedis();
    console.log('Redis initialized.');

    console.log('Initializing workers...');
    const workerManager = new WorkerManager(redis);
    streamWorker(workerManager);
    console.log('Workers initialized.');
};
