FROM node:16.19.0-bullseye-slim AS builder

RUN mkdir /count-together
WORKDIR /count-together

COPY package.json package-lock.json tsconfig.json jest.config.js ./

RUN npm ci

COPY . .

RUN npm run build

#
# Go back from clean node image
#
FROM node:16.19.0-bullseye-slim

RUN mkdir /count-together /count-together/node_modules /count-together/dist
WORKDIR /count-together

COPY --from=builder ["/count-together/package.json", "/count-together/package-lock.json", "./"]
COPY --from=builder /count-together/node_modules ./node_modules/
COPY --from=builder /count-together/dist ./dist/

ARG APP_VERSION=untagged
RUN echo "APP_VERSION=$APP_VERSION" >/count-together/dist/.env

EXPOSE 4050

CMD ["npm", "run", "serve"]
