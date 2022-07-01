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
     */
    constructor() {
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
     * @return {Promise<google.auth.OAuth2>}
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

        // eslint-disable-next-line camelcase
        const {client_id, client_secret, redirect_uris} = contents;
        const oauth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            // eslint-disable-next-line camelcase
            redirect_uris[0],
        );

        if (
            !fs.existsSync(
                path.resolve(
                    new URL(import.meta.url).pathname,
                    '../google_tokens.json',
                ),
            )
        )
            throw new Error('Tokens file not found');

        const tokens = JSON.parse(
            await fs.promises
                .readFile(
                    path.resolve(
                        new URL(import.meta.url).pathname,
                        '../google_tokens.json',
                    ),
                    {encoding: 'utf8'},
                )
                .catch((err) => '{"err": "'.concat(err.message, '"}')),
        );

        if (tokens.err) throw new Error(tokens.err);
        oauth2Client.setCredentials(tokens);

        return oauth2Client;
    }
}
