FROM node:14.15.1-stretch-slim

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json .
COPY jest.config.js .

RUN npm install typescript@4.1.3
RUN npm install --production

COPY . .

ARG VERSION=untagged
ARG BUILD_CONFIGURATION=production
RUN echo "export const version = '$VERSION';\nexport const configuration = '$BUILD_CONFIGURATION';\n" > ./src/version.ts

RUN npm run build-ts

EXPOSE 4050

CMD ["npm", "run", "serve"]
