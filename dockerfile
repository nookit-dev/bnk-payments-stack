FROM oven/bun:latest

COPY package.json ./
COPY bun.lockb ./

COPY index.ts ./

COPY ./src ./src

EXPOSE 80

RUN bun install

CMD ["bun", "run", "serve"]