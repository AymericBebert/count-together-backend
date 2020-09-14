export interface IPlayer {
    name: string;
    scores: (number | null)[];
}

export const pickIPlayer = (player: IPlayer): IPlayer => ({
    name: player.name,
    scores: [...player.scores],
});
