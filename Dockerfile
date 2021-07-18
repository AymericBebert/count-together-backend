FROM node:16.2.0-buster-slim AS builder

RUN mkdir /count-together
WORKDIR /count-together

COPY package.json package-lock.json tsconfig.json jest.config.js ./

RUN npm ci

COPY . .

RUN npm run build

#
# Go back from clean node image
#
FROM node:16.2.0-buster-slim

RUN mkdir /count-together /count-together/node_modules /count-together/dist
WORKDIR /count-together

COPY --from=builder ["/count-together/package.json", "/count-together/package-lock.json", "./"]
COPY --from=builder /count-together/node_modules ./node_modules/
COPY --from=builder /count-together/dist ./dist/

ARG VERSION=untagged
RUN echo $VERSION > /version.txt

EXPOSE 4050

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm", "run", "serve"]
