FROM node:22-alpine

ARG API_PUBLIC_URL
ARG API_PUBLIC_PORT

RUN apk add --no-cache libc6-compat python3 make g++

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package.json ./

COPY --chown=node:node package-lock.json ./

USER node

RUN npm ci

COPY --chown=node:node . .

RUN npm run compile
RUN npm run build:dashboard

ENV VIPS_CONCURRENCY=$(nproc)

EXPOSE 3000
ENV PORT=3000

HEALTHCHECK --interval=12s --timeout=12s --start-period=5s CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/health || exit 1

CMD ["node", "build/index.js"]
