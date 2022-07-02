import {Processor, Queue, Worker, WorkerOptions} from 'bullmq';

/**
 * @class WorkerBase
 */
export class WorkerBase extends Worker {
    public jobsHandle: Map<string, Processor> = new Map();
    public queue!: Queue;

    /**
     * @param {string} name - The name of the worker.
     * @param {object} opts - The options of the worker.
     */
    constructor(name: string, opts?: WorkerOptions) {
        super(
            name,
            async (job, token) => {
                if (this.jobsHandle.has(job.name.toLowerCase())) {
                    return this.jobsHandle.get(job.name.toLowerCase())!(
                        job,
                        token,
                    );
                }
            },
            opts,
        );

        console.log(`[Worker: ${name}] initialized.`);
    }

    /**
     * Register a process.
     * @param {string} name - The name of the job.
     * @param {Processor} processor - The processor of the job.
     * @return {WorkerBase}
     */
    register(name: string, processor: Processor): WorkerBase {
        console.log(`[Worker: ${this.name}] Registering job '${name}' ...`);
        this.jobsHandle.set(name.toLowerCase(), processor);
        return this;
    }

    /**
     * Unregister a process.
     * @param {string} name - The name of the job.
     * @return {WorkerBase}
     */
    unregister(name: string): WorkerBase {
        this.jobsHandle.delete(name.toLowerCase());
        return this;
    }
}
