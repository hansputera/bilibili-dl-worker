import {WorkerManager} from '../workers/manager.js';

import {downloaderJob} from './stream_jobs/downloader.js';

export const streamWorker = async (manager: WorkerManager) => {
    manager
        .createWorker('stream')
        // Downloader job
        .register('downloader', downloaderJob);
};
