import 'dotenv/config';

import http from 'node:http';

const server = http.createServer();

server.on('request', (_, res) => {
    res.end('Hello world');
});

server.listen(parseInt(process.env.PORT!) || 3000, '0.0.0.0');
