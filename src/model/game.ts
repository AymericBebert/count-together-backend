import mongoose, {HydratedDocument} from 'mongoose';
import {GameType} from './game-type';
import {pickPlayer, Player, PlayerDocument, playerSchema} from './player';

export interface Game {
    gameId: string;
    name: string;
    gameType: GameType;
    lowerScoreWins: boolean;
    players: Player[];
}

export interface StoredGame extends Omit<Game, 'players'> {
    players: PlayerDocument[];
}

export const gameSchema = new mongoose.Schema<StoredGame>({
    gameId: {type: String, required: true, unique: true, index: true},
    name: String,
    gameType: String,
    lowerScoreWins: Boolean,
    players: [playerSchema],
});

export const GameM = mongoose.model<StoredGame>('Game', gameSchema);

export type GameDocument = HydratedDocument<StoredGame>

export const pickGame = (game: Game): Game => ({
    gameId: game.gameId,
    name: game.name,
    gameType: game.gameType,
    lowerScoreWins: game.lowerScoreWins,
    players: [...game.players.map(p => pickPlayer(p))],
});
