import {ConnectionOptions, WorkerOptions} from 'bullmq';
import {WorkerBase} from './workerBase.js';

/**
 * @class WorkerManager
 */
export class WorkerManager {
    private workers: Map<string, WorkerBase> = new Map();

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
        const w = new WorkerBase(name, {
            ...opts,
            connection: this.redis,
        });
        this.workers.set(name, w);
        return w;
    }

    /**
     * Unregister a worker.
     * @param {string} name - The name of the worker.
     * @return {WorkerManager}
     */
    unregister(name: string): WorkerManager {
        this.workers.delete(name);
        return this;
    }
}
