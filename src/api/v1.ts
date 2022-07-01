import {App} from '@tinyhttp/app';

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
