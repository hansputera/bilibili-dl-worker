## Bilibili-DL Worker

Worker for [bilibili-dl](https://github.com/hansputera/bilibili-dl.git)

## Features
- Free, and open-source 💰
- Fast ✨

## Deploy
### Local-deploy
0. Install NodeJS, and pnpm.
1. You need to clone this project, type `git clone https://github.com/hansputera/bilibili-dl-worker.git bili-worker`
2. Go to cloned directory, type `cd bili-worker`
3. Install dependencies, type `pnpm install`
4. Configure environments, type `cp .env.schema .env`, don't forget to fill `REDIS_URL` in .env file with your redis connection URL.
5. Build project source-code, type `pnpm run build` or `tsc -p tsconfig.json`
6. Run it, type `node dist/index.js`

## Contributors
- [@hansputera](https://github.com/hansputera) - creator

## License
MIT
