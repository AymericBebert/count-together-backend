# count-together backend

Backend for count-together project

## Run the server
Normal run
`npm run start`

Debug run
`DEBUG_SOCKET=1 npm run start`

## Run tests
`npm run test`

## Run lint
`npm run lint`

With auto fix
`npm run lint-fix`

## Backup

### Dump

```shell
mongodump --uri="mongodb://root:password@localhost:27017/count?authSource=admin" --gzip --archive="count-together-$(date -u +"%Y-%m-%dT%H-%M-%SZ").archive.gz"
```

### Restore

```shell
mongorestore --uri="mongodb://root:password@localhost:27017/count?authSource=admin" --gzip --archive="count-together-$DATE.archive.gz" --drop
```
