import 'dotenv/config';

import http from 'node:http2';

const server = http.createServer({
    'maxSessionMemory': 1024 * 1024 * 1024,
});

server.on('request', (_, res) => {
    res.end('OK!');
});

server.listen(parseInt(process.env.PORT!) || 3000);
