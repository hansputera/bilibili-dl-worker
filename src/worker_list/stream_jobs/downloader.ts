import {Processor, Job} from 'bullmq';
import {checkDownloadArgs} from '../../validators/index.js';
import {streamWorkerPool} from '../stream.js';

/**
 * Downloader job.
 * @param {Job} job - Job object.
 * @return {Promise<any>}
 */
export const downloaderJob: Processor = async (job: Job): Promise<any> => {
    const validMessage = checkDownloadArgs(job.data);
    if (validMessage) {
        await job.log('Invalid download args: ' + validMessage.toString());
        if (Array.isArray(validMessage)) {
            throw new Error(
                validMessage.map((x) => `${x.field} ${x.message}`).join('\n'),
            );
        } else {
            throw new Error(validMessage.toString());
        }
    }

    job.updateProgress(25);
    const result = await streamWorkerPool.run(job.data, {
        name: 'download',
    });

    // TODO: i will think about it
};
