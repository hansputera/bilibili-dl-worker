import {Job, Processor} from 'bullmq';
import {checkMergeArgs} from '../../validators/index.js';
import {streamWorkerPool} from '../stream.js';

/**
 * Combine audio and video job.
 * @param {Job} job - Job object.
 */
export const combineJob: Processor = async (job: Job) => {
    const validMessage = await checkMergeArgs(job.data);
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

    let result = await streamWorkerPool.run(
        {
            identifier: job.data.identifier,
        },
        {
            name: 'checkConvertedFile',
            filename: new URL(
                '../../piscina_workers/stream-two.js',
                import.meta.url,
            ).href,
        },
    );
    if (!result)
        result = await streamWorkerPool.run(
            {
                identifier: job.data.identifier,
                audio: Buffer.from(job.data.audio),
                video: Buffer.from(job.data.video),
            },
            {
                filename: new URL(
                    '../../piscina_workers/stream-two.js',
                    import.meta.url,
                ).href,
                name: 'mergeAudioAndVideo',
            },
        );

    return {
        ...result,
        identifier: job.data.identifier,
        job: job.name,
    };
};
