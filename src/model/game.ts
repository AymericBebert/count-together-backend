import {IPlayer, pickIPlayer} from './player';

export type GameType = 'free' | 'smallScores' | 'winOrLose';

export interface IGame {
    gameId: string;
    name: string;
    gameType: GameType;
    lowerScoreWins: boolean;
    players: IPlayer[];
}

export const pickIGame = (game: IGame): IGame => ({
    gameId: game.gameId,
    name: game.name,
    gameType: game.gameType,
    lowerScoreWins: game.lowerScoreWins,
    players: [...game.players.map(p => pickIPlayer(p))],
});

export interface IGameEditName {
    gameId: string;
    name: string;
}

export interface IGameEditWin {
    gameId: string;
    lowerScoreWins: boolean;
}

export interface IGameEditGameType {
    gameId: string;
    gameType: GameType;
}

export interface IGameEditPlayer {
    gameId: string;
    playerId: number;
    playerName: string;
}

export interface IGameRemovePlayer {
    gameId: string;
    playerId: number;
}

export interface IGameEditScore {
    gameId: string;
    playerId: number;
    scoreId: number;
    score: number;
}

export interface IGameRemoveScore {
    gameId: string;
    playerId: number;
    scoreId: number;
}
