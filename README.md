# count-together backend

Backend for count-together project

## Installation

```shell
cp .env.dist .env
npm install
```

## Run the server

```shell
npm run start
```

## Run tests

```shell
npm run test
```

## Run lint

```shell
npm run lint
```

With auto fix

```shell
npm run lint:fix
```

## Build and publish a new version

We use GitHub Actions to build the new version on release.

In order to build a new version, you need to create a new release on GitHub, using semver tags.

## Backup

### Dump

```shell
mongodump --uri="mongodb://root:password@localhost:27017/count?authSource=admin" --gzip --archive="count-together-$(date -u +"%Y-%m-%dT%H-%M-%SZ").archive.gz"
```

### Restore

```shell
mongorestore --uri="mongodb://root:password@localhost:27017/count?authSource=admin" --gzip --archive="count-together-$DATE.archive.gz" --drop
```
