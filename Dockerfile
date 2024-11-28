FROM node:22.11.0-bookworm-slim AS builder

WORKDIR /count-together

COPY package.json package-lock.json tsconfig.json ./

RUN npm ci

COPY . .

RUN npm run build
RUN rm -rf node_modules
RUN npm ci --production

#
# Go back from clean node image
#
FROM node:22.11.0-bookworm-slim

WORKDIR /count-together
RUN mkdir /count-together/node_modules /count-together/dist

COPY --from=builder ["/count-together/package.json", "/count-together/package-lock.json", "./"]
COPY --from=builder /count-together/node_modules ./node_modules/
COPY --from=builder /count-together/dist ./dist/

ARG APP_VERSION=untagged
RUN echo "APP_VERSION=$APP_VERSION" >/count-together/dist/.env

EXPOSE 4050

CMD ["npm", "run", "serve"]
