import Piscina from 'piscina';
import got from 'got';
import childProcess from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
import {tmpdir} from 'node:os';
import internal from 'node:stream';

import {DownloadArgs} from './@typings/receiver.js';

if (!Piscina.isWorkerThread)
    throw new Error('This script must be run in a worker thread');

/**
 * Job function.
 * @param {DownloadArgs} args - Download arguments.
 * @return {Promise<void>}
 */
export default async function (args: DownloadArgs): Promise<
    Omit<DownloadArgs, 'identifier'> & {
        data: string;
    }
> {
    return await new Promise((resolve, reject) => {
        const audioStream = got.stream(args.audioUrl, {
            headers: {
                Origin: 'https://www.bilibili.tv',
                Referer: 'https://www.bilibili.tv/en',
            },
        });

        const videoStream = got.stream(args.videoUrl, {
            headers: {
                Origin: 'https://www.bilibili.tv',
                Referer: 'https://www.bilibili.tv/en',
            },
        });

        const ffmpegStream = childProcess.spawn(
            ffmpeg,
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
                `${tmpdir()}/${args.identifier}.mp4`,
            ],
            {
                windowsHide: true,
                stdio: ['pipe', 'pipe', 'inherit'],
            },
        );

        ffmpegStream.on('error', reject);

        ffmpegStream.on('exit', (code) => {
            // TODO: upload file to gdrive.
            if (code === 0)
                resolve({
                    audioUrl: args.audioUrl,
                    videoUrl: args.videoUrl,
                    data: `${tmpdir()}/${args.identifier}.mp4`,
                });
            else reject(new Error(`FFmpeg exited with code ${code}`));
        });

        videoStream.pipe(ffmpegStream.stdio[0]!);
        audioStream.pipe(ffmpegStream.stdio.at(1) as internal.Writable);
    });
}
