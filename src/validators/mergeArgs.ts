import type {ValidationError} from 'fastest-validator';
import type {MergeArgs} from '../@typings/workers.js';
import {validator} from './initial.js';

/**
 * validate
 * @param {T} data - Data to validate.
 * @return {Promise<string | ValidationError[] | undefined>}
 */
export const checkMergeArgs = async <T extends MergeArgs>(
    data: T,
): Promise<string | ValidationError[] | undefined> => {
    const result = await validator.compile({
        identifier: {
            type: 'string',
            required: true,
        },
        audio: {
            type: 'url',
            required: true,
        },
        video: {
            type: 'url',
            required: true,
        },
    })(data);

    return typeof result === 'boolean' ? undefined : result;
};
