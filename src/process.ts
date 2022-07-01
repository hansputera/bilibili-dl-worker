import Piscina from 'piscina';
import BullMQ from 'bullmq';
import {checkDownloadArgs} from './validators/index.js';
import {getRedis} from './db/redis.js';
import {GAPI} from './gapi.js';
import {google} from 'googleapis';
import {createReadStream, existsSync} from 'fs';
import {resolve} from 'path';
import {tmpdir} from 'os';

/**
 * Initialize the process.
 * @return {Promise<void>}
 */
export const initProcess = async (): Promise<void> => {
    const jobPool = new Piscina({
        filename: new URL('./job.js', import.meta.url).href,
        maxQueue: 'auto',
    });

    const gapi = new GAPI();
    await gapi.init();

    const gDrive = google.drive({
        version: 'v3',
        auth: gapi.client,
    });

    const redis = getRedis();

    new BullMQ.Worker(
        'bilibili-dl-combine',
        async (job) => {
            const valid = checkDownloadArgs(job.data);
            if (valid) {
                job.update({
                    status: 'invalid',
                    message: valid,
                    ...job.data,
                });
            } else {
                if (
                    existsSync(resolve(tmpdir(), `${job.data.identifier}.mp4`))
                ) {
                    let file = await gDrive.files.get({
                        fileId: job.data.identifier,
                    });

                    if (!file)
                        file = await gDrive.files.create({
                            media: {
                                mimeType: 'video/mp4',
                                body: createReadStream(
                                    resolve(
                                        tmpdir(),
                                        `${job.data.identifier}.mp4`,
                                    ),
                                ),
                            },
                            fields: 'id',
                            requestBody: {
                                id: job.data.identifier,
                                name: job.data.identifier,
                                shared: true,
                            },
                        });

                    job.update({
                        status: 'done',
                        message: 'Successfuly',
                        ...job.data,
                        data: file.data.webContentLink || file.data.webViewLink,
                    });
                }
                const data = await jobPool.run({
                    identifier: job.data.identifier,
                    videoUrl: job.data.videoUrl,
                    audioUrl: job.data.audioUrl,
                });

                if (data instanceof Error) {
                    return job.update({
                        status: 'error',
                        message: data.message,
                        ...job.data,
                    });
                }

                const file = await gDrive.files.create({
                    media: {
                        mimeType: 'video/mp4',
                        body: createReadStream(data.data),
                    },
                    fields: 'id',
                    requestBody: {
                        id: job.data.identifier,
                        name: job.data.identifier,
                        shared: true,
                    },
                });

                job.update({
                    status: 'done',
                    message: 'Successfuly',
                    ...job.data,
                    data: file.data.webContentLink || file.data.webViewLink,
                });
            }
        },
        {
            connection: redis,
        },
    );
};
