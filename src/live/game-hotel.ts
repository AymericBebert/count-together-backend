import socketIO from 'socket.io';
import {emitEvent} from '../events';
import {GamesService} from '../games/games.service';
import {Game} from '../model/game';
import {GameRoom} from './game-room';

export class GameHotel {
    private rooms: { [gameId: string]: GameRoom } = {};

    constructor(private readonly io: socketIO.Server) {
    }

    public async addConnection(socket: socketIO.Socket, gameId: string): Promise<boolean> {
        if (!this.rooms[gameId]) {
            const game = await GamesService.getGameById(gameId).catch(err => console.error('addConnection err:', err));
            if (!game) {
                console.warn(`addConnection to ${gameId} failed: game does not exist`);
                return false;
            }
            this.rooms[gameId] = new GameRoom(this.io, game);
        }
        const connected = this.rooms[gameId].addConnection(socket);
        if (connected) {
            emitEvent(socket, 'game', this.rooms[gameId].game);
        }
        const numConnected = await this.rooms[gameId].getConnectionCount();
        console.log(`Room ${this.rooms[gameId].room}: client joined (${numConnected} connected) ${socket.id}`);
        return connected;
    }

    public async removeConnection(socket: socketIO.Socket, gameId: string): Promise<boolean> {
        if (!this.rooms[gameId]) {
            return false;
        }
        const removed = this.rooms[gameId].removeConnection(socket);
        const numConnected = await this.rooms[gameId].getConnectionCount();
        console.log(`Room ${this.rooms[gameId].room}: client left (${numConnected} connected) ${socket.id}`);
        if (numConnected === 0) {
            this.rooms[gameId].destroy();
            delete this.rooms[gameId];
            console.log(`Cleaned up room of game ${gameId}`);
        }
        return removed;
    }

    public sendGame(socket: socketIO.Socket, gameId: string): boolean {
        if (!this.rooms[gameId]) {
            return false;
        }
        return socket.emit('game', this.rooms[gameId]);
    }

    public updateGame(game: Game): void {
        if (!this.rooms[game.gameId]) {
            return;
        }
        this.rooms[game.gameId].game = game;
        this.rooms[game.gameId].emit('game', game);
    }

    public deleteGame(gameId: string): void {
        if (!this.rooms[gameId]) {
            return;
        }
        this.rooms[gameId].emit('game deleted', gameId);
        this.rooms[gameId].destroy();
        delete this.rooms[gameId];
    }
}
