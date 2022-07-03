import Piscina from 'piscina';
import childProcess from 'node:child_process';
import ffmpegStatic from 'ffmpeg-static';
import {readFile} from 'node:fs/promises';
import {Readable, Writable} from 'node:stream';
import {cwd} from 'node:process';

import type {MergeArgs} from '../@typings/workers.js';

if (!Piscina.isWorkerThread) {
    throw new Error('This file should only be run in a worker thread.');
}

/**
 * Merge two audio and video files into a single file.
 * @param {MergeArgs} param0 - The arguments to merge the audio and video together.
 * @return {Promise<{ type: "Buffer", data: number[] }>} - The merged audio and video.
 */
export const mergeAudioAndVideo = async ({
    audio,
    video,
    identifier,
}: MergeArgs): Promise<{type: 'Buffer'; data: number[]}> => {
    audio = Buffer.from(audio);
    video = Buffer.from(video);

    return await new Promise(async (resolve, reject) => {
        const ffmpeg = childProcess.spawn(
            ffmpegStatic,
            [
                '-loglevel',
                '8',
                '-hide_banner',
                '-i',
                'pipe:0',
                '-i',
                'pipe:1',
                '-c:v',
                'copy',
                '-c:a',
                'aac',
                '-y',
                `${cwd()}/downloads/${identifier}_converted.mp4`,
            ],
            {
                stdio: ['pipe', 'pipe', 'inherit'],
                windowsHide: true,
            },
        );

        ffmpeg.on('error', reject);
        ffmpeg.on('exit', async (code) => {
            if (code !== 0) {
                reject(new Error('FFMPEG exited with code ' + code));
                return;
            }

            return resolve(
                (
                    await readFile(
                        `${cwd()}/downloads/${identifier}_converted.mp4`,
                    )
                ).toJSON(),
            );
        });

        Readable.from(audio).pipe(ffmpeg.stdio[0]);
        Readable.from(video).pipe(ffmpeg.stdio.at(1) as Writable);
    });
};

/**
 * Check if the converted file is exists.
 * @param {{identifier: string}} param0 - The identifier of the video to download.
 * @return {Promise<{ type: "Buffer", data: number[] }>} - The downloaded video.
 */
export const checkConvertedFile = async ({
    identifier,
}: {
    identifier: string;
}): Promise<{type: 'Buffer'; data: number[]} | undefined> => {
    const file = await readFile(
        `${cwd()}/downloads/${identifier}_converted.mp4`,
    ).catch(() => undefined);
    return file ? file.toJSON() : undefined;
};