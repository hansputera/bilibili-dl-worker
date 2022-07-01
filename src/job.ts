import Piscina from 'piscina';

if (!Piscina.isWorkerThread)
    throw new Error('This script must be run in a worker thread');

/**
 * Job function.
 * @param {{audioUrl: string, videoUrl: string}} param0
 */
export default async function ({
    audioUrl,
    videoUrl,
}: {
    audioUrl: string;
    videoUrl: string;
}) {
    return {
        audioUrl: audioUrl,
        videoUrl: videoUrl,
    };
}
