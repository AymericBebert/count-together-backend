import socketIO from 'socket.io';
import {Subject} from 'rxjs';
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

    public addConnection(socket: socketIO.Socket): Promise<boolean> {
        return new Promise(resolve => {
            socket.join(this.room, (err: any) => {
                console.log(`Room ${this.room}: client joined (${this.connectionCount} connected) ${socket.id}`);
                resolve(!err);
            });
        });
    }

    public removeConnection(socket: socketIO.Socket): Promise<boolean> {
        return new Promise(resolve => {
            socket.leave(this.room, (err: any) => {
                console.log(`Room ${this.room}: client left (${this.connectionCount} connected) ${socket.id}`);
                resolve(!err);
            });
        });
    }

    public get connectionCount(): number {
        return Object.values(this.io.in(this.room).sockets)
            .filter(s => !!s.rooms[this.room]).length;
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
