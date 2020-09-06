import {IPlayer, pickIPlayer} from './player';

export interface IGame {
    gameId: string;
    name: string;
    lowerScoreWins: boolean;
    players: IPlayer[];
}

export const pickIGame = (game: IGame): IGame => ({
    gameId: game.gameId,
    name: game.name,
    lowerScoreWins: game.lowerScoreWins,
    players: [...game.players.map(p => pickIPlayer(p))],
});
