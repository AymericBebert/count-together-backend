import mongoose from 'mongoose';
import {GameType, IGame, pickIGame} from '../model/game';
import {IPlayer} from '../model/player';
import {generateToken} from '../utils/generate-token';

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
    gameType: String,
    lowerScoreWins: Boolean,
    players: [playerSchema],
});

interface IGameModel extends IGame, mongoose.Document {
    players: mongoose.Types.Array<IPlayerModel>;
}

const Game = mongoose.model<IGameModel>('Game', gameSchema);

export class GamesService {

    public static async addGame(game: IGame): Promise<IGame> {
        return new Game(game).save().then(g => pickIGame(g));
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

    public static async deleteAllGames(): Promise<void> {
        return Game.deleteMany({}).then(() => void 0);
    }

    public static async duplicateGame(gameId: string): Promise<IGame | null> {
        const game = await GamesService.getGameById(gameId);
        if (!game) {
            throw new Error('Cannot duplicate: did not find game');
        }
        return GamesService.addGame({
            ...game,
            players: game.players.map(player => ({
                ...player,
                scores: [],
            })),
            gameId: generateToken(8),
            name: GamesService.duplicateGameName(game.name),
        });
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

    public static async updateGameType(gameId: string, gameType: GameType): Promise<IGame> {
        const game = await Game.findOne({gameId: gameId});
        if (!game) {
            throw new Error(`The game with id "${gameId}" does not exist`);
        }
        game.gameType = gameType;
        if (gameType === 'smallScores' || gameType === 'winOrLose') {
            const maxScoreLength = Math.max(...game.players.map(p => p.scores.length));
            for (const player of game.players) {
                if (player.scores.length < maxScoreLength) {
                    player.scores.push(...new Array<number>(maxScoreLength - player.scores.length).fill(0));
                }
            }
        }
        if (gameType === 'winOrLose') {
            for (const player of game.players) {
                player.scores.forEach((s, i) => {
                    if (s !== 0 && s !== 1) {
                        player.scores.set(i, s ? 1 : 0);
                    }
                });
            }
        }
        const res = await game.save();
        if (!res) {
            throw new Error(`Error updating game "${gameId}"`);
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
            if (game.gameType === 'smallScores' || game.gameType === 'winOrLose') {
                const maxScoreLength = Math.max(...game.players.map(p => p.scores.length));
                game.players[game.players.length - 1].scores.push(...new Array<number>(maxScoreLength).fill(0));
            }
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
        if (playerId === -1) {
            for (const player of game.players) {
                if (player.scores.length < scoreId + 1) {
                    player.scores.push(...new Array<number>(scoreId + 1 - player.scores.length).fill(0));
                }
            }
        } else {
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
        if (playerId === -1) {
            for (const player of game.players) {
                if (scoreId === player.scores.length - 1) {
                    player.scores.pop();
                }
            }
        } else {
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
        }
        const res = await game.save();
        if (!res) {
            throw new Error(`Error updating game "${gameId}"`);
        }
        return pickIGame(res);
    }

    private static duplicateGameName(original: string): string {
        const match = /(.*) (\d+)$/.exec(original);
        if (match) {
            const version = parseInt(match[2], 10) + 1;
            return `${match[1]} ${version}`;
        }
        return `${original} - 2`;
    }
}
