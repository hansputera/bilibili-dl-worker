/* eslint-disable camelcase */
import * as fs from 'node:fs';
import * as path from 'node:path';
import {cwd} from 'node:process';
import {createInterface} from 'node:readline';
import {google} from 'googleapis';

if (!fs.existsSync(path.resolve(cwd(), 'google_credentials.json'))) {
    console.error('google_credentials.json not found');
    process.exit(1);
}

if (fs.existsSync(path.resolve(cwd(), 'google_tokens.json')))
    throw new Error('google_tokens.json already exists');

let contents = fs.readFileSync(path.resolve(cwd(), 'google_credentials.json'), {
    encoding: 'utf8',
});
contents = JSON.parse(contents);

const oAuth2Client = new google.auth.OAuth2(
    contents.installed.client_id,
    contents.installed.client_secret,
    contents.installed.redirect_uris[0],
);

const generatedAuthUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.metadata',
        'https://www.googleapis.com/auth/drive.file',
    ],
});

console.log('Visit this url:', generatedAuthUrl, '\n');
const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
        if (err) {
            console.error('Error while trying to retrieve access token', err);
            return;
        }
        oAuth2Client.setCredentials(token);
        fs.writeFileSync(
            path.resolve(cwd(), 'google_tokens.json'),
            JSON.stringify(token),
        );
        console.log('Token stored to google_tokens.json');
    });
});
