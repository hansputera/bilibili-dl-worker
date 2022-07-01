import 'dotenv/config';

import http from 'node:http';
import {initProcess} from './process.js';

const server = http.createServer();

initProcess();

server.on('request', (_, res) => {
    res.end('Hello world');
});

server.listen(parseInt(process.env.PORT!) || 3000, '0.0.0.0');
