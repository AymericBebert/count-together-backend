FROM node:12.16.1-buster-slim

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json .
COPY tslint.json .
COPY jest.config.js .

RUN npm install typescript@3.8.3
RUN npm install --production

COPY . .

ARG VERSION=untagged
ARG BUILD_CONFIGURATION=production
RUN echo "export const version = '$VERSION';\nexport const configuration = '$BUILD_CONFIGURATION';\n" > ./src/version.ts

RUN npm run build

CMD ["npm", "run", "serve"]
