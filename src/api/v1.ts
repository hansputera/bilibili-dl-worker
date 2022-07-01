import {App} from '@tinyhttp/app';
import {readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';

export const v1App = new App({
    noMatchHandler: (_, res) => {
        return res.status(404).json({
            message: 'The resource you are looking for does not exist.',
        });
    },
    onError: (err, _, res) => {
        return res.status(500).json({
            message: 'An error has occurred.',
            error: err.name.concat(': ', err.message),
        });
    },
});

v1App.get('/', (_, res) => res.status(200).send('Hello World'));
v1App.get('/tmp_videos', (_, res) => {
    return res
        .status(200)
        .json(readdirSync(tmpdir()).filter((fl) => fl.endsWith('.mp4')));
});
