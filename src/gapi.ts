import * as fs from 'node:fs';
import * as path from 'node:path';
import {google} from 'googleapis';

/**
 * @class GAPI
 */
export class GAPI {
    private credentialsFilePath!: string;

    /**
     * @constructor
     * @param {string[]} scopes - The scopes to request.
     */
    constructor(private scopes: string[]) {
        if (!Array.isArray(scopes)) throw new Error('Scopes must be an array');
        this.credentialsFilePath = path.resolve(
            new URL(import.meta.url).pathname,
            '../google_credentials.json',
        );
        if (!fs.existsSync(this.credentialsFilePath))
            throw new Error(
                `Credentials file not found at ${this.credentialsFilePath}`,
            );
    }

    /**
     * Initialize the Google API client.
     * @returns {Promise<google.auth.OAuth2>}
     */
    async init() {
        const contents = JSON.parse(
            await fs.promises
                .readFile(this.credentialsFilePath, {
                    encoding: 'utf8',
                })
                .catch((err) => '{"err": "'.concat(err.message, '"}')),
        );

        if (contents.err) throw new Error(contents.err);

        const {client_id, client_secret, redirect_uris} = contents;
        const oauth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0],
        );

        const token = await oauth2Client.getToken(contents.refresh_token);
        oauth2Client.setCredentials(token.tokens);

        return oauth2Client;
    }
}
