import {Subject} from 'rxjs';
import socketIO from 'socket.io';
import {EmittedEventTypes} from '../events';
import {IGame} from '../model/game';

export class GameRoom {
    public destroy$: Subject<void> = new Subject<void>();
    private readonly gameId: string;

    constructor(private readonly io: socketIO.Server,
                private _game: IGame) {
        this.gameId = _game.gameId;
    }

    public get game(): IGame {
        return this._game;
    }

    public set game(game: IGame) {
        if (game.gameId === this.gameId) {
            this._game = game;
        } else {
            console.error(`Error: trying to update room ${this.gameId} with game ${game.gameId}`);
        }
    }

    public get room(): string {
        return this.gameId;
    }

    public addConnection(socket: socketIO.Socket): boolean {
        try {
            void socket.join(this.room);
        } catch (e) {
            console.error(e);
            return false;
        }
        return true;
    }

    public removeConnection(socket: socketIO.Socket): boolean {
        try {
            void socket.leave(this.room);
        } catch (e) {
            console.error(e);
            return false;
        }
        return true;
    }

    public getConnectionCount(): Promise<number> {
        return this.io.sockets.adapter.sockets(new Set([this.room])).then(s => s.size);
    }

    public destroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public emit<T extends keyof EmittedEventTypes>(eventName: T, ...args: Array<EmittedEventTypes[T]>): void {
        if (process.env.DEBUG_SOCKET) {
            console.log(`socket< [${this.room}] ${eventName}: ${JSON.stringify(args[0])?.substr(0, 999)}`);
        } else {
            console.log(`Emitting event to clients of ${this.room}: ${eventName}`);
        }
        this.io.to(this.room).emit(eventName, ...args);
    }
}
