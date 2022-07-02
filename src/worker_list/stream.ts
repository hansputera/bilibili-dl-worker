import {WorkerManager} from '../workers/manager.js';

export const streamWorker = async (manager: WorkerManager) => {
    manager.createWorker('stream')
    // Downloader job
        .register('downloader', async (job) => {
            console.log(`[Job: ${job.id}] Downloader`);
        });
};
