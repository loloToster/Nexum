FROM node:20 AS builder

WORKDIR /tmp/app

COPY ./package*.json ./
COPY ./server/package*.json ./server/
COPY ./client/package*.json ./client/

# generate correct prisma client
COPY ./server/prisma/ ./server/prisma/

# apply patch-package patches
COPY ./client/patches/ ./client/patches/

RUN npm run install:all

COPY . .

RUN npm run build:raw


FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /tmp/app/package*.json ./
COPY --from=builder /tmp/app/server/package*.json ./server/

# installs only prod deps
RUN cd ./server && npm i

COPY --from=builder /tmp/app/client/web-build ./client/web-build
COPY --from=builder /tmp/app/server/prisma ./server/prisma
COPY --from=builder /tmp/app/server/dist ./server/dist

EXPOSE 3000

CMD ["npm", "start"]
