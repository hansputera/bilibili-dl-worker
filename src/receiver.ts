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
    redis.on('message', async (chan: string, detail: DownloadArgs) => {
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

                const rd = await redis.get(detail.identifier);
                if (rd && ['done', 'wait'].includes(JSON.parse(rd).status)) {
                    return;
                }

                console.log(`Received download request: ${detail.identifier}`);
                redis.set(
                    detail.identifier,
                    JSON.stringify({
                        status: 'wait',
                        audioUrl: detail.audioUrl,
                        videoUrl: detail.videoUrl,
                    }),
                );

                const data = await jobPool.run({
                    identifier: detail.identifier,
                    audioUrl: detail.audioUrl,
                    videoUrl: detail.videoUrl,
                });

                if (!data) redis.del(detail.identifier);
                else
                    redis.set(
                        detail.identifier,
                        JSON.stringify({
                            status: 'done',
                            audioUrl: detail.audioUrl,
                            videoUrl: detail.videoUrl,
                            data,
                        }),
                    );

                console.log(`Started job: ${detail.identifier}`);
            }
        } catch {
            console.error(`Invalid message: ${JSON.stringify(detail)}`);
        }
    });

    redis.subscribe('download');
    return;
}
