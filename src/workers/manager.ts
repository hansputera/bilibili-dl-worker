import {ConnectionOptions, WorkerOptions} from 'bullmq';
import {WorkerBase} from './workerBase.js';

/**
 * @class WorkerManager
 */
export class WorkerManager {
    /**
     * @constructor
     * @param {ConnectionOptions} redis - The redis connection options.
     */
    constructor(private redis: ConnectionOptions) {}

    /**
     * Register a worker.
     * @param {string} name - The name of the worker.
     * @param {WorkerOptions} opts - The options of the worker.
     * @return {WorkerBase}
     */
    createWorker(name: string, opts?: WorkerOptions): WorkerBase {
        return new WorkerBase(name, {
            ...opts,
            connection: this.redis,
        });
    }
}
