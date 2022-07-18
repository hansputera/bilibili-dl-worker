FROM node:17.9.1-alpine3.15

RUN apk update

RUN mkdir -p /home/bilibili-dl-worker
COPY . /home/bilibili-dl-worker
WORKDIR /home/bilibili-dl-worker

RUN npm i pnpm -g

RUN pnpm install
RUN pnpm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]