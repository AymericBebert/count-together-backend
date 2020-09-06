import mongoose from 'mongoose';
import {IGame, pickIGame} from '../model/game';

interface IGameModel extends IGame, mongoose.Document {
}

const playerSchema = new mongoose.Schema({
    name: String,
    scores: [Number],
});

const gameSchema = new mongoose.Schema({
    gameId: {type: String, required: true, unique: true, index: true},
    name: String,
    lowerScoreWins: Boolean,
    players: [playerSchema],
});

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

    public static async updateGame(game: IGame): Promise<IGame> {
        const res = await Game.findOneAndUpdate({gameId: game.gameId}, game, {new: true});
        if (!res) {
            throw new Error(`The game with id "${game.gameId}" does not exist`);
        }
        return pickIGame(res);
    }

    public static async deleteGame(gameId: string): Promise<void> {
        return Game.deleteOne({gameId}).then(() => void 0);
    }
}
