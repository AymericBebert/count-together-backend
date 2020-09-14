import mongoose from 'mongoose';
import {IGame, pickIGame} from '../model/game';
import {IPlayer} from '../model/player';

const playerSchema = new mongoose.Schema({
    name: String,
    scores: [Number],
});

interface IPlayerModel extends IPlayer, mongoose.Document {
    scores: mongoose.Types.Array<number | null>;
}

const gameSchema = new mongoose.Schema({
    gameId: {type: String, required: true, unique: true, index: true},
    name: String,
    lowerScoreWins: Boolean,
    players: [playerSchema],
});

interface IGameModel extends IGame, mongoose.Document {
    players: mongoose.Types.Array<IPlayerModel>;
}

const Game = mongoose.model<IGameModel>('Game', gameSchema);

export class GamesService {

    public static async addGame(game: IGame): Promise<IGame> {
        return Game.create(game).then(g => pickIGame(g));
    }

    public static async getGameById(gameId: string): Promise<IGame | null> {
        return Game.findOne({gameId}).then(g => g ? pickIGame(g) : null);
    }

    public static async getGames(): Promise<IGame[]> {
        return Game.find({}).then(gs => gs.map(g => pickIGame(g)));
    }

    public static async updateGame(newGame: IGame): Promise<IGame> {
        const game = await Game.findOne({gameId: newGame.gameId});
        if (!game) {
            throw new Error(`The game with id "${newGame.gameId}" does not exist`);
        }
        game.overwrite(newGame);
        const res = await game.save();
        if (!res) {
            throw new Error(`Error updating game "${newGame.gameId}"`);
        }
        return pickIGame(res);
    }

    public static async deleteGame(gameId: string): Promise<void> {
        return Game.deleteOne({gameId}).then(() => void 0);
    }

    public static async updateGameName(gameId: string, name: string): Promise<IGame> {
        const res = await Game.findOneAndUpdate(
            {gameId: gameId},
            {name: name},
            {new: true},
        );
        if (!res) {
            throw new Error(`The game with id "${gameId}" does not exist`);
        }
        return pickIGame(res);
    }

    public static async updateGameWin(gameId: string, lowerScoreWins: boolean): Promise<IGame> {
        const res = await Game.findOneAndUpdate(
            {gameId: gameId},
            {lowerScoreWins: lowerScoreWins},
            {new: true},
        );
        if (!res) {
            throw new Error(`The game with id "${gameId}" does not exist`);
        }
        return pickIGame(res);
    }

    public static async updateGamePlayer(gameId: string, playerId: number, playerName: string): Promise<IGame> {
        const game = await Game.findOne({gameId});
        if (game === null) {
            throw new Error(`The game with id "${gameId}" does not exist`);
        }
        if (playerId > game.players.length) {
            throw new Error(`playerId ${playerId} is too large`);
        } else if (playerId === game.players.length) {
            game.players.push({name: playerName, scores: []});
        } else {
            game.players[playerId].name = playerName;
        }
        const res = await game.save();
        if (!res) {
            throw new Error(`Error updating game "${gameId}"`);
        }
        return pickIGame(res);
    }

    public static async removeGamePlayer(gameId: string, playerId: number): Promise<IGame> {
        const game = await Game.findOne({gameId});
        if (game === null) {
            throw new Error(`The game with id "${gameId}" does not exist`);
        }
        if (playerId >= game.players.length) {
            throw new Error(`playerId ${playerId} is too large`);
        } else if (playerId === game.players.length - 1) {
            game.players.pop();
        } else {
            throw new Error(`playerId ${playerId} cannot be removed`);
        }
        const res = await game.save();
        if (!res) {
            throw new Error(`Error updating game "${gameId}"`);
        }
        return pickIGame(res);
    }

    public static async updateGameScore(gameId: string, playerId: number, scoreId: number, score: number):
        Promise<IGame> {
        const game = await Game.findOne({gameId});
        if (game === null) {
            throw new Error(`The game with id "${gameId}" does not exist`);
        }
        const player = game.players[playerId];
        if (!player) {
            throw new Error(`The player with id "${playerId}" does not exist`);
        }
        if (scoreId > player.scores.length) {
            throw new Error(`scoreId ${scoreId} is too large`);
        } else if (scoreId === player.scores.length) {
            player.scores.push(score);
        } else {
            player.scores.set(scoreId, score);
        }
        const res = await game.save();
        if (!res) {
            throw new Error(`Error updating game "${gameId}"`);
        }
        return pickIGame(res);
    }

    public static async removeGameScore(gameId: string, playerId: number, scoreId: number): Promise<IGame> {
        const game = await Game.findOne({gameId});
        if (game === null) {
            throw new Error(`The game with id "${gameId}" does not exist`);
        }
        const player = game.players[playerId];
        if (!player) {
            throw new Error(`The player with id "${playerId}" does not exist`);
        }
        if (player.scores.length === 0) {
            return pickIGame(game);
        } else if (scoreId > player.scores.length) {
            throw new Error(`scoreId ${scoreId} is too large`);
        } else if (scoreId === player.scores.length - 1) {
            player.scores.pop();
        } else {
            player.scores.set(scoreId, null);
        }
        const res = await game.save();
        if (!res) {
            throw new Error(`Error updating game "${gameId}"`);
        }
        return pickIGame(res);
    }
}
