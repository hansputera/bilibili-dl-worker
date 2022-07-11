import Piscina from 'piscina';
import got from 'got';
import type {DownloadArgs} from '../@typings/receiver.js';
import {createWriteStream} from 'fs';
import {resolve} from 'node:path';
import {stat, unlink} from 'node:fs/promises';
import {cwd} from 'node:process';
import {getCurrentAddress} from '../util.js';

if (!Piscina.isWorkerThread)
    throw new Error('This file should only be run in a worker thread.');

/**
 * Downloader job (piscina worker).
 * @param {DownloadArgs} param0 - Download args.
 * @return {Promise<{audio: string, video: string}>}
 */
export const downloadWorker = async ({
    audioUrl,
    videoUrl,
    identifier,
}: DownloadArgs): Promise<{audio: string; video: string}> => {
    return await new Promise(async (resolvePromise, reject) => {
        try {
            // 1 = audio complete.
            // 2 = video complete.
            let status = 0;

            const address = await getCurrentAddress();
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
                        audio: new URL(`./${identifier}_audio.mp3`, address)
                            .href,
                        video: new URL(`./${identifier}_video.mp4`, address)
                            .href,
                    });
                }
            });

            videoWriter.on('close', async () => {
                if (status === 0) {
                    status = 2;
                } else if (status !== 0 && status === 1) {
                    return resolvePromise({
                        audio: new URL(`./${identifier}_audio.mp3`, address)
                            .href,
                        video: new URL(`./${identifier}_video.mp4`, address)
                            .href,
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
 * @return {Promise<{audio: string, video: string}>}
 */
export const checkFilesDownloadById = async ({
    identifier,
}: {
    identifier: string;
}): Promise<
    | {
          audio: string;
          video: string;
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
        const address = await getCurrentAddress();
        return {
            audio: new URL(`./${identifier}_audio.mp3`, address).href,
            video: new URL(`./${identifier}_video.mp4`, address).href,
        };
    } else {
        return undefined;
    }
};
