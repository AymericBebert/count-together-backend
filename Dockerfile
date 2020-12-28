FROM node:14.15.3-stretch-slim AS builder

RUN mkdir /count-together
WORKDIR /count-together

COPY package.json package-lock.json tsconfig.json jest.config.js ./

RUN npm ci

COPY . .

ARG VERSION=untagged
ARG BUILD_CONFIGURATION=production
RUN echo "export const version = '$VERSION';\nexport const configuration = '$BUILD_CONFIGURATION';\n" > ./src/version.ts

RUN npm run build

#
# Go back from clean node image
#
FROM node:14.15.3-stretch-slim

RUN mkdir /count-together /count-together/node_modules /count-together/dist
WORKDIR /count-together

COPY --from=builder ["/count-together/package.json", "/count-together/package-lock.json", "./"]
COPY --from=builder /count-together/node_modules ./node_modules/
COPY --from=builder /count-together/dist ./dist/

EXPOSE 4050

CMD ["npm", "run", "serve"]
