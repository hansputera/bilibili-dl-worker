import type {ValidationError} from 'fastest-validator';
import {DownloadArgs} from '../@typings/receiver.js';
import {validator} from './initial.js';

/**
 * Validate the download arguments.
 * @param {T} data download args
 * @return {Promise<ValidationError[] | string | undefined>}
 */
export const checkDownloadArgs = async <T extends DownloadArgs>(
    data: T,
): Promise<ValidationError[] | string | undefined> => {
    const result = await validator.compile({
        identifier: {
            type: 'string',
            optional: true,
        },
        audioUrl: {
            type: 'url',
            required: true,
        },
        videoUrl: {
            type: 'url',
            required: true,
        },
    })(data);

    return typeof result === 'boolean' ? undefined : result;
};
