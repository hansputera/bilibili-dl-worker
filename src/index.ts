import 'dotenv/config';

import http from 'node:http';
import nodeStatic from 'node-static';
import {cwd} from 'node:process';

import {initProcess} from './process.js';

const staticServer = new nodeStatic.Server(`${cwd()}/downloads`, {
    cache: 7200,
});
const server = http.createServer(async (req, res) => {
    req.addListener('end', async () => {
        staticServer.serve(req, res, (err) => {
            if (err) {
                res.statusCode = (err as unknown as {status: number}).status;
                res.end(err.message);
            }
        });
    }).resume();
});

initProcess();
server.on('error', console.error);

server.on('listening', () => {
    console.log('Server listening to', server.address());
});

server.listen(parseInt(process.env.PORT!) || 3000, '0.0.0.0');
