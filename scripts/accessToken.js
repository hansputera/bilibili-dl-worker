import * as fs from 'node:fs';
import * as path from 'node:path';
import { cwd } from 'node:process';

if (!fs.existsSync(
    path.resolve(cwd(), 'google_credentials.json')
)) {
    console.error('google_credentials.json not found');
    process.exit(1);
}

