import 'dotenv/config';

import {App as TinyHttpApp} from '@tinyhttp/app';
import {logger} from '@tinyhttp/logger';

const app = new TinyHttpApp({
    noMatchHandler: (_, res) => {
        return res.status(404).send('Not found');
    },
});

app.use(
    logger({
        ip: true,
        timestamp: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        emoji: true,
    }),
);

app.listen(parseInt(process.env.PORT!) || 3000);
