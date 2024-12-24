import {Game, GameDocument, GameM, pickGame} from '../model/game';
import {PlayerEdition} from '../model/game-edit-dtos';
import {GameType} from '../model/game-type';
import {Player, PlayerDocument} from '../model/player';
import {generateToken} from '../utils/generate-token';

export class GamesService {

    public static async addGame(game: Game): Promise<Game> {
        if (await GameM.findOne({gameId: game.gameId})) {
            throw new Error(`A game with id "${game.gameId}" already exists`);
        }
        return GameM.create(game).then(g => pickGame(g));
    }

    public static async getGameById(gameId: string): Promise<Game | null> {
        return GameM.findOne({gameId}).then(g => g ? pickGame(g) : null);
    }

    public static async getGames(): Promise<Game[]> {
        return GameM.find({}).then(gs => gs.map(g => pickGame(g)));
    }

    public static async updateGame(newGame: Game): Promise<Game> {
        const game = await GameM.findOne({gameId: newGame.gameId});
        if (!game) {
            throw new Error(`The game with id "${newGame.gameId}" does not exist`);
        }
        game.overwrite(newGame);
        const res = await game.save();
        if (!res) {
            throw new Error(`Error updating game "${newGame.gameId}"`);
        }
        return pickGame(res);
    }

    public static async deleteGame(gameId: string): Promise<void> {
        await GameM.deleteOne({gameId});
    }

    public static async deleteAllGames(): Promise<void> {
        await GameM.deleteMany({});
    }

    public static async duplicateGame(gameId: string): Promise<Game> {
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

    public static async updateGameName(gameId: string, name: string): Promise<Game> {
        const res = await GameM.findOneAndUpdate(
            {gameId: gameId},
            {name: name},
            {new: true},
        );
        if (!res) {
            throw new Error(`The game with id "${gameId}" does not exist`);
        }
        return pickGame(res);
    }

    public static async updateGameType(gameId: string, gameType: GameType): Promise<Game> {
        const game = await GameM.findOne({gameId: gameId});
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
        return pickGame(res);
    }

    public static async updateGameWin(gameId: string, lowerScoreWins: boolean): Promise<Game> {
        const res = await GameM.findOneAndUpdate(
            {gameId: gameId},
            {lowerScoreWins: lowerScoreWins},
            {new: true},
        );
        if (!res) {
            throw new Error(`The game with id "${gameId}" does not exist`);
        }
        return pickGame(res);
    }

    public static async updateGamePlayer(gameId: string, playerId: number, playerName: string): Promise<Game> {
        const game = await GamesService.getGameOrThrow(gameId);
        if (playerId > game.players.length) {
            throw new Error(`playerId ${playerId} is too large`);
        } else if (playerId === game.players.length) {
            game.players.push({name: playerName, scores: []} as unknown as PlayerDocument);
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
        return pickGame(res);
    }

    public static async updateGamePlayers(gameId: string, edits: PlayerEdition[]): Promise<Game> {
        const game = await GamesService.getGameOrThrow(gameId);
        const oldScores = game.players.map(p => p.scores);
        const newPlayers: Player[] = edits.map(e => e.oldPlayerId >= 0 && oldScores[e.oldPlayerId]
            ? {name: e.playerName, scores: oldScores[e.oldPlayerId]}
            : {name: e.playerName, scores: []}
        );
        game.players = newPlayers as unknown as PlayerDocument[];
        if (game.gameType === 'smallScores' || game.gameType === 'winOrLose') {
            const maxScoreLength = Math.max(...game.players.map(p => p.scores.length));
            for (const player of game.players) {
                if (player.scores.length < maxScoreLength) {
                    player.scores.push(...new Array<number>(maxScoreLength - player.scores.length).fill(0));
                }
            }
        }
        const res = await game.save();
        if (!res) {
            throw new Error(`Error updating game "${gameId}"`);
        }
        return pickGame(res);
    }

    public static async removeGamePlayer(gameId: string, playerId: number): Promise<Game> {
        const game = await GamesService.getGameOrThrow(gameId);
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
        return pickGame(res);
    }

    public static async updateGameScore(gameId: string, playerId: number, scoreId: number, score: number):
        Promise<Game> {
        const game = await GamesService.getGameOrThrow(gameId);
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
        return pickGame(res);
    }

    public static async removeGameScore(gameId: string, playerId: number, scoreId: number): Promise<Game> {
        const game = await GamesService.getGameOrThrow(gameId);
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
                return pickGame(game);
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
        return pickGame(res);
    }

    private static async getGameOrThrow(gameId: string): Promise<GameDocument> {
        const game = await GameM.findOne({gameId});
        if (!game) {
            throw new Error(`The game with id "${gameId}" does not exist`);
        }
        return game;
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
