import type {DownloadArgs} from './@typings/receiver.js';
import {getRedis} from './db/redis.js';
import ow from 'ow/dist';
import Piscina from 'piscina';

export const jobPool = new Piscina({
    filename: new URL('./job.js', import.meta.url).href,
    maxQueue: 'auto',
    resourceLimits: {
        stackSizeMb: 6,
        codeRangeSizeMb: 10,
    },
});

/**
 * Initialize the receiver.
 * @return {Promise<void>}
 */
export async function receiverInit(): Promise<void> {
    const redis = getRedis();
    redis.on('message', (chan: string, detail: DownloadArgs) => {
        try {
            if (chan === 'download') {
                ow(
                    detail,
                    ow.object.exactShape({
                        audioUrl: ow.string.nonEmpty.url,
                        videoUrl: ow.string.nonEmpty.url,
                        identifier: ow.string.nonEmpty.minLength(5),
                    }),
                );

                console.log(`Received download request: ${detail.identifier}`);

                jobPool.run({
                    identifier: detail.identifier,
                    audioUrl: detail.audioUrl,
                    videoUrl: detail.videoUrl,
                });

                console.log(`Started job: ${detail.identifier}`);
            }
        } catch {
            console.error(`Invalid message: ${JSON.stringify(detail)}`);
        }
    });

    redis.subscribe('download');
    return;
}
