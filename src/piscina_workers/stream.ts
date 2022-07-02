import Piscina from 'piscina';
import got from 'got';
import type {DownloadArgs} from '../@typings/receiver.js';
import {createWriteStream} from 'fs';
import {resolve} from 'path';
import {tmpdir} from 'os';

if (!Piscina.isWorkerThread)
    throw new Error('This file should only be run in a worker thread.');

/**
 * Downloader job (piscina worker).
 * @param {DownloadArgs} param0 - Download args.
 */
const downloadWorker = async ({
    audioUrl,
    videoUrl,
    identifier,
}: DownloadArgs) => {
    return await new Promise((resolvePromise, reject) => {
        try {
            // 1 = audio complete.
            // 2 = video complete.
            let status = 0;

            const audioWriter = createWriteStream(
                resolve(tmpdir(), `${identifier}_audio.mp3`),
                {
                    autoClose: true,
                },
            );
            const videoWriter = createWriteStream(
                resolve(tmpdir(), `${identifier}_video.mp4`),
                {
                    autoClose: true,
                },
            );

            audioWriter.on('close', () => {
                if (status === 0) {
                    status = 1;
                } else if (status !== 0 && status === 2) {
                    return resolvePromise({
                        audio: resolve(tmpdir(), `${identifier}_audio.mp3`),
                        video: resolve(tmpdir(), `${identifier}_video.mp4`),
                    });
                }
            });

            videoWriter.on('close', () => {
                if (status === 0) {
                    status = 2;
                } else if (status !== 0 && status === 1) {
                    return resolvePromise({
                        audio: resolve(tmpdir(), `${identifier}_audio.mp3`),
                        video: resolve(tmpdir(), `${identifier}_video.mp4`),
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
            return reject(new Error('Failed to download.'));
        }
    });
};

export default {
    download: downloadWorker,
};
