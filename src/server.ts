import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import {Server} from 'http';
import {Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import socketIO from 'socket.io';
import {fromEventTyped} from './events';
import gamesRouter from './games/games.router';
import {loggerMiddleware} from './middlewares/logger';
import {connectMongooseWithRetry} from './utils/mongodb-connect';
import {GameHotel} from './live/game-hotel';
import {GamesService} from './games/games.service';
import {configuration, version} from './version';

// Get config from env
const port = process.env.PORT || 4050;

// Connecting to mongoDB
connectMongooseWithRetry().catch(err => console.error('Could not connect to Database', err));

// Creating web server
const app = express();
const http = new Server(app);

// HTTP middleware and CORS
app.use(loggerMiddleware);

const corsAllowedOrigin = process.env.CORS_ALLOWED_ORIGIN || '';
if (corsAllowedOrigin) {
    app.use(cors({origin: `${corsAllowedOrigin}`, optionsSuccessStatus: 200, credentials: true}));
} else {
    app.use(cors());
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Socket.IO server and CORS config
const io = socketIO(http);
const sioAllowedOrigin = process.env.SIO_ALLOWED_ORIGIN || '';
if (sioAllowedOrigin) {
    io.origins([sioAllowedOrigin]);
}

// HTTP healthCheck route
app.get('/healthCheck', (request, response) => {
    response.send({hostname: request.hostname, status: 'ok', version, configuration});
});

// routes
app.use('/games', gamesRouter);

// hotel
const hotel = new GameHotel(io);

// Socket.IO new connection
const onConnection = (socket: socketIO.Socket): void => {
    console.log(`New connection from ${socket.id}`);
    const exited$ = new Subject<void>();

    fromEventTyped(socket, 'game join').subscribe(async gameId => {

        const added = await hotel.addConnection(socket, gameId);
        if (!added) {
            return
        }

        fromEventTyped(socket, 'game update')
            .pipe(takeUntil(exited$))
            .subscribe(game => GamesService.updateGame(game).then(newGame => hotel.updateGame(newGame)));

        fromEventTyped(socket, 'game delete')
            .pipe(filter(gid => gid === gameId), takeUntil(exited$))
            .subscribe(gid => GamesService.deleteGame(gid).then(() => hotel.deleteGame(gid)));

        fromEventTyped(socket, 'disconnect')
            .pipe(takeUntil(exited$))
            .subscribe(() => {
                exited$.next();
                hotel.removeConnection(socket, gameId);
            });

        fromEventTyped(socket, 'game exit')
            .pipe(takeUntil(exited$))
            .subscribe(() => {
                exited$.next();
                hotel.removeConnection(socket, gameId);
            });

        return;
    });
};

io.on('connection', socket => onConnection(socket));

http.listen(port, () => console.log(`Listening on port ${port}!`));
