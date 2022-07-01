import 'dotenv/config';

import http from 'node:http2';

const server = http.createServer({
    maxSessionMemory: 1024 * 1024 * 1024,
});

server.on('stream', (stream) => {
    stream.end('Hello World!');
});

server.listen(parseInt(process.env.PORT!) || 3000);
