import {GameType} from './game-type';

export interface GameEditName {
    gameId: string;
    name: string;
}

export interface GameEditWin {
    gameId: string;
    lowerScoreWins: boolean;
}

export interface GameEditGameType {
    gameId: string;
    gameType: GameType;
}

export interface GameEditPlayer {
    gameId: string;
    playerId: number;
    playerName: string;
}

export interface GameRemovePlayer {
    gameId: string;
    playerId: number;
}

export interface GameEditScore {
    gameId: string;
    playerId: number;
    scoreId: number;
    score: number;
}

export interface GameRemoveScore {
    gameId: string;
    playerId: number;
    scoreId: number;
}
