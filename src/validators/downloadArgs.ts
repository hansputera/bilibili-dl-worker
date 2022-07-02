import {ValidationError} from 'fastest-validator';
import {DownloadArgs} from '../@typings/receiver.js';
import {validator} from './initial.js';

/**
 * Validate the download arguments.
 * @param {T} data download args
 * @return {string | undefined}
 */
export const checkDownloadArgs = <T extends DownloadArgs>(
    data: T,
): ValidationError[] | string | undefined => {
    const result = validator.compile({
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

    return typeof result === 'boolean'
        ? undefined
        : (result as string | ValidationError[]);
};
