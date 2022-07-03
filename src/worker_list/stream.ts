import Piscina from 'piscina';
import {WorkerManager} from '../workers/manager.js';

import {combineJob} from './stream_jobs/combine.js';
import {downloaderJob} from './stream_jobs/downloader.js';

export const streamWorkerPool = new Piscina({
    filename: new URL('../piscina_workers/stream.js', import.meta.url).href,
    maxQueue: 'auto',
});

export const streamWorker = async (manager: WorkerManager) => {
    manager
        .createWorker('stream')
        // Downloader job
        .register('downloader', downloaderJob)
        // Combine job
        .register('combine', combineJob);
};
