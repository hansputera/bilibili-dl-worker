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
            type: 'object',
            required: true,
            props: {
                type: 'string',
                data: 'array',
            },
        },
        video: {
            type: 'object',
            required: true,
            props: {
                type: 'string',
                data: 'array',
            },
        },
    })(data);

    return typeof result === 'boolean' ? undefined : result;
};
