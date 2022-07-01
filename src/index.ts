import 'dotenv/config';

import {App as TinyHttpApp} from '@tinyhttp/app';
import {logger} from '@tinyhttp/logger';
import {cors} from '@tinyhttp/cors';
import {rateLimit} from '@tinyhttp/rate-limit';
import {apiApp} from './api/index.js';

const app = new TinyHttpApp({
    noMatchHandler: (_, res) => {
        return res
            .status(404)
            .send('The resource you are looking for does not exist.');
    },
    onError: (err, _, res) => {
        res.setHeader('Error-Message', err.message);
        return res.status(500).send('An error has occurred.');
    },
});

app.use(
    logger({
        ip: true,
        timestamp: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        emoji: true,
    }),
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }),
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 50, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
    }),
);

app.all('/', (_, res) => {
    return res.status(201).send('OK!');
});

app.route('/api').use(apiApp);

app.listen(parseInt(process.env.PORT!) || 3000);
