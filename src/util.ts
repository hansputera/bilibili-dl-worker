import got from 'got';

/**
 * Get current machine address (in string-URL)
 * @return {Promise<string>}
 */
export const getCurrentAddress = async (): Promise<string> => {
    // is it running on heroku?
    if (process.env.DYNO && process.env.HOME === '/app') {
        return `https://${process.env.DOMAIN}.herokuapp.com`;
    }

    // is it running on railway?
    // src: https://docs.railway.app/develop/variables
    if (
        process.env.RAILWAY_STATIC_URL ||
        process.env.RAILWAY_GIT_COMMIT_SHA ||
        process.env.RAILWAY_GIT_AUTHOR ||
        process.env.RAILWAY_GIT_BRANCH ||
        process.env.RAILWAY_GIT_REPO_NAME ||
        process.env.RAILWAY_GIT_REPO_OWNER ||
        process.env.RAILWAY_GIT_COMMIT_MESSAGE ||
        process.env.RAILWAY_HEALTHCHECK_TIMEOUT_SEC ||
        process.env.RAILWAY_ENVIRONMENT
    ) {
        return `https://${process.env.RAILWAY_STATIC_URL}`;
    }

    // is it running in replit?
    // ref: https://replit.com/talk/ask/Can-a-Python-script-detect-it-is-running-in-replit/24945
    // ref(2): https://replit.com/talk/ask/How-I-can-get-my-project-link/112233
    if (
        process.env.USER === 'runner' &&
        process.env.REPL_OWNER &&
        process.env.REPL_SLUG
    ) {
        return `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
    }

    // is it running in glitch?
    if (
        typeof process.env.PROJECT_DOMAIN === 'string' &&
        typeof process.env.PROJECT_ID === 'string' &&
        process.env.HOME === '/app'
    ) {
        return `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
    }

    // i assume it's running on VPS.
    const ip = await got('https://api.ipify.org').text();
    return `http://${ip}:${process.env.PORT || 3000}`;
};
