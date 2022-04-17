# count-together backend

Backend for count-together project

## Installation

`cp .env.dist .env`

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
npm run lint-fix
```

## Backup

### Dump

```shell
mongodump --uri="mongodb://root:password@localhost:27017/count?authSource=admin" --gzip --archive="count-together-$(date -u +"%Y-%m-%dT%H-%M-%SZ").archive.gz"
```

### Restore

```shell
mongorestore --uri="mongodb://root:password@localhost:27017/count?authSource=admin" --gzip --archive="count-together-$DATE.archive.gz" --drop
```
