# Arguments
ARG NODE_VERSION=lts-alpine

# NOTE: Ensure you set NODE_VERSION Build Argument as follows...
#
#  export NODE_VERSION="$(cat .nvmrc)-alpine" \
#  docker build \
#    --build-arg NODE_VERSION=$NODE_VERSION \
#    -t mojaloop/sdk-scheme-adapter:local \
#    . \
#

# Build Image
FROM node:${NODE_VERSION} AS builder
WORKDIR /opt/app

RUN apk --no-cache add git
RUN apk add --no-cache -t build-dependencies make gcc g++ python3 libtool openssl-dev autoconf automake bash \
    && cd $(npm root -g)/npm

COPY package.json package-lock.json* /opt/app/

RUN npm ci

COPY tsconfig.json /opt/app/
COPY src /opt/app/src
COPY config /opt/app/config

RUN npm run build:ts
RUN cp -r src/interface dist/interface
RUN find dist -name '*.map' -delete

FROM node:${NODE_VERSION}
WORKDIR /opt/app

# Create empty log file & link stdout to the application log file
RUN mkdir ./logs && touch ./logs/combined.log
RUN ln -sf /dev/stdout ./logs/combined.log

# Create a non-root user: ml-user
RUN adduser -D ml-user

COPY --chown=ml-user --from=builder /opt/app/package.json /opt/app/package-lock.json* ./
COPY --chown=ml-user --from=builder /opt/app/node_modules ./node_modules
COPY --chown=ml-user --from=builder /opt/app/dist ./dist
COPY --chown=ml-user --from=builder /opt/app/config ./config
RUN npm prune --production
USER ml-user

EXPOSE 4003
CMD ["npm", "run", "start"]
