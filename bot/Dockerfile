FROM node:19-alpine AS base

RUN npm i -g pnpm

FROM base AS dependencies

ENV NODE_ENV='production'

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --prod

FROM base AS build

WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules

RUN pnpm build

FROM base AS deploy

WORKDIR /app
COPY --from=build /app/dist/ ./dist
COPY --from=build /app/node_modules ./node_modules

CMD [ "node", "dist/src/index.js" ]
