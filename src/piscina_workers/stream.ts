import Piscina from 'piscina';
import got from 'got';
import type {DownloadArgs} from '../@typings/receiver.js';
import {createWriteStream} from 'fs';
import {resolve} from 'node:path';
import {readFile, stat, unlink} from 'node:fs/promises';
import {cwd} from 'node:process';

if (!Piscina.isWorkerThread)
    throw new Error('This file should only be run in a worker thread.');

/**
 * Downloader job (piscina worker).
 * @param {DownloadArgs} param0 - Download args.
 */
export const downloadWorker = async ({
    audioUrl,
    videoUrl,
    identifier,
}: DownloadArgs) => {
    return await new Promise(async (resolvePromise, reject) => {
        try {
            // 1 = audio complete.
            // 2 = video complete.
            let status = 0;

            const audioWriter = createWriteStream(
                resolve(cwd(), 'downloads', `${identifier}_audio.mp3`),
                {
                    autoClose: true,
                },
            );
            const videoWriter = createWriteStream(
                resolve(cwd(), 'downloads', `${identifier}_video.mp4`),
                {
                    autoClose: true,
                },
            );

            audioWriter.on('close', async () => {
                if (status === 0) {
                    status = 1;
                } else if (status !== 0 && status === 2) {
                    return resolvePromise({
                        audio: (
                            await readFile(
                                resolve(
                                    cwd(),
                                    'downloads',
                                    `${identifier}_audio.mp3`,
                                ),
                            )
                        ).toJSON(),
                        video: (
                            await readFile(
                                resolve(
                                    cwd(),
                                    'downloads',
                                    `${identifier}_video.mp4`,
                                ),
                            )
                        ).toJSON(),
                    });
                }
            });

            videoWriter.on('close', async () => {
                if (status === 0) {
                    status = 2;
                } else if (status !== 0 && status === 1) {
                    return resolvePromise({
                        audio: (
                            await readFile(
                                resolve(
                                    cwd(),
                                    'downloads',
                                    `${identifier}_audio.mp3`,
                                ),
                            )
                        ).toJSON(),
                        video: (
                            await readFile(
                                resolve(
                                    cwd(),
                                    'downloads',
                                    `${identifier}_video.mp4`,
                                ),
                            )
                        ).toJSON(),
                    });
                }
            });

            got.stream(audioUrl, {
                headers: {
                    Origin: 'https://www.bilibili.tv',
                    Referer: 'https://www.bilibili.tv/en',
                },
            }).pipe(audioWriter);

            got.stream(videoUrl, {
                headers: {
                    Origin: 'https://www.bilibili.tv',
                    Referer: 'https://www.bilibili.tv/en',
                },
            }).pipe(videoWriter);
        } catch {
            unlink(resolve(cwd(), 'downloads', `${identifier}_audio.mp3`));
            unlink(resolve(cwd(), 'downloads', `${identifier}_video.mp4`));
            return reject(new Error('Failed to download.'));
        }
    });
};

/**
 * Check downloaded files by id.
 * @param {{identifier: string}} param0 - CheckFileDownloadById args.
 * @return {Promise<{audio: {type: "buffer", data: number[]}, video: {type: "Buffer", data: number[]}}>}
 */
export const checkFilesDownloadById = async ({
    identifier,
}: {
    identifier: string;
}): Promise<
    | {
          audio: {type: 'Buffer'; data: number[]};
          video: {type: 'Buffer'; data: number[]};
      }
    | undefined
> => {
    const statsAudio = await stat(
        resolve(cwd(), 'downloads', `${identifier}_audio.mp3`),
    ).catch(() => undefined);
    const statsVideo = await stat(
        resolve(cwd(), 'downloads', `${identifier}_video.mp4`),
    ).catch(() => undefined);

    if (
        statsAudio &&
        statsVideo &&
        statsAudio.isFile() &&
        statsVideo.isFile() &&
        statsAudio.size > 0 &&
        statsVideo.size > 0
    ) {
        return {
            audio: (
                await readFile(
                    resolve(cwd(), 'downloads', `${identifier}_audio.mp3`),
                )
            ).toJSON(),
            video: (
                await readFile(
                    resolve(cwd(), 'downloads', `${identifier}_video.mp4`),
                )
            ).toJSON(),
        };
    } else {
        return undefined;
    }
};
