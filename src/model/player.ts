import mongoose, {HydratedDocument} from 'mongoose';

export interface Player {
    name: string;
    scores: (number | null)[];
}

export interface StoredPlayer extends Omit<Player, 'scores'> {
    scores: mongoose.Types.Array<number | null>;
}

export const playerSchema = new mongoose.Schema<StoredPlayer>({
    name: String,
    scores: [Number],
});

export type PlayerDocument = HydratedDocument<StoredPlayer>;

export const pickPlayer = (player: Player): Player => ({
    name: player.name,
    scores: [...player.scores],
});
