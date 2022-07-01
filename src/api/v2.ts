import {App} from '@tinyhttp/app';
import {randomUUID} from 'crypto';
import {getRedis} from '../db/redis.js';

export const v2App = new App();

v2App.post('/download', (req, res) => {
    const {audioUrl, videoUrl} = req.body;
    const identifier = req.body.identifier || randomUUID();
    const redis = getRedis();
    redis.publish(
        'download',
        JSON.stringify({
            audioUrl,
            videoUrl,
            identifier,
        }),
    );
    return res.status(200).json({
        identifier,
    });
});
