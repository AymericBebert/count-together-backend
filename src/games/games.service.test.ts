import {GamesService} from './games.service';
import {connectMongooseWithRetry} from '../tests/mongodb-memory-connect';
import {IGame} from '../model/game';

describe('GamesService', () => {

    async function cleanAll(): Promise<void> {
        const allGames = await GamesService.getGames().catch(() => void 0) || [];
        for (const g of allGames.filter(g => g.gameId.startsWith('test_'))) {
            await GamesService.deleteGame(g.gameId);
        }
    }

    beforeAll(async () => {
        await connectMongooseWithRetry();
    });

    beforeEach(async () => {
        await cleanAll();
    });

    afterAll(async () => {
        await cleanAll();
    });

    describe('Games service tests', () => {

        it('games CRUD', async () => {
            const game01: IGame = {
                gameId: 'test_game',
                name: 'Test Game',
                gameType: 'free',
                lowerScoreWins: false,
                players: [
                    {name: 'A', scores: [4]},
                    {name: 'B', scores: []},
                ],
            };

            const game01bis = await GamesService.addGame(game01);
            expect(game01bis).toEqual(game01);

            const game01ter = await GamesService.addGame(game01)
                .catch(() => console.log('[OK] games add game01ter error'));
            expect(game01ter).toBeFalsy();

            await GamesService.updateGame({
                gameId: 'test_game',
                name: 'Test Game Updated',
                gameType: 'free',
                lowerScoreWins: true,
                players: [
                    {name: 'A', scores: [1, 2, 3]},
                    {name: 'C', scores: []},
                ],
            });
            const game02 = await GamesService.getGameById(game01.gameId);
            expect(game02 && game02.name).toEqual('Test Game Updated');
            expect(game02 && game02.lowerScoreWins).toBeTruthy();
            expect(game02 && game02.players).toEqual([
                {name: 'A', scores: [1, 2, 3]},
                {name: 'C', scores: []},
            ]);

            const allGames = await GamesService.getGames();
            const testGames = allGames.filter(g => g.gameId.startsWith('test_'));
            expect(testGames.length).toEqual(1);

            await GamesService.deleteGame(game01.gameId);
            const allGames2 = await GamesService.getGames();
            const testGames2 = allGames2.filter(g => g.gameId.startsWith('test_'));
            expect(testGames2.length).toEqual(0);
        });

        it('games edit lowerScoreWins', async () => {
            const game01: IGame = {
                gameId: 'test_game',
                name: 'Test Game',
                gameType: 'free',
                lowerScoreWins: false,
                players: [],
            };

            await GamesService.addGame(game01);
            let game01bis: IGame | null;

            await GamesService.updateGameWin(game01.gameId, true);
            game01bis = await GamesService.getGameById(game01.gameId);
            expect(game01bis && game01bis.lowerScoreWins).toEqual(true);

            await GamesService.updateGameWin(game01.gameId, false);
            game01bis = await GamesService.getGameById(game01.gameId);
            expect(game01bis && game01bis.lowerScoreWins).toEqual(false);
        });

        it('games edit name', async () => {
            const game01: IGame = {
                gameId: 'test_game',
                name: 'Test Game',
                gameType: 'free',
                lowerScoreWins: false,
                players: [],
            };

            await GamesService.addGame(game01);

            await GamesService.updateGameName(game01.gameId, 'New Name');
            const game01bis = await GamesService.getGameById(game01.gameId);
            expect(game01bis && game01bis.name).toEqual('New Name');
        });

        it('games edit players', async () => {
            const game01: IGame = {
                gameId: 'test_game',
                name: 'Test Game',
                gameType: 'free',
                lowerScoreWins: false,
                players: [],
            };

            await GamesService.addGame(game01);
            let game01bis: IGame | null;

            await GamesService.updateGamePlayer(game01.gameId, 0, 'New player_');
            await GamesService.updateGamePlayer(game01.gameId, 0, 'New player');
            await GamesService.updateGamePlayer(game01.gameId, 1, 'New player 1');
            game01bis = await GamesService.getGameById(game01.gameId);
            expect(game01bis && game01bis.players.length).toEqual(2);
            expect(game01bis && game01bis.players[0].name).toEqual('New player');
            expect(game01bis && game01bis.players[0].scores).toEqual([]);
            expect(game01bis && game01bis.players[1].name).toEqual('New player 1');

            await GamesService.updateGameScore(game01.gameId, 0, 0, 5);
            await GamesService.updateGameScore(game01.gameId, 0, 1, 6);
            await GamesService.updateGameScore(game01.gameId, 0, 1, 7);
            game01bis = await GamesService.getGameById(game01.gameId);
            expect(game01bis && game01bis.players[0].scores).toEqual([5, 7]);

            await expect(
                async () => await GamesService.updateGamePlayer(game01.gameId, 9, 'aaa')
            ).rejects.toThrow('playerId 9 is too large');

            await expect(
                async () => await GamesService.updateGameScore(game01.gameId, 9, 0, 5)
            ).rejects.toThrow('The player with id "9" does not exist');

            await expect(
                async () => await GamesService.updateGameScore(game01.gameId, 0, 9, 5)
            ).rejects.toThrow('scoreId 9 is too large');

            await GamesService.removeGameScore(game01.gameId, 0, 0);
            game01bis = await GamesService.getGameById(game01.gameId);
            expect(game01bis && game01bis.players[0].scores).toEqual([null, 7]);

            await GamesService.removeGameScore(game01.gameId, 0, 1);
            await GamesService.removeGameScore(game01.gameId, 0, 0);
            game01bis = await GamesService.getGameById(game01.gameId);
            expect(game01bis && game01bis.players[0].scores).toEqual([]);

            await GamesService.removeGamePlayer(game01.gameId, 1);
            await GamesService.removeGamePlayer(game01.gameId, 0);
            game01bis = await GamesService.getGameById(game01.gameId);
            expect(game01bis && game01bis.players.length).toEqual(0);
        });

        it('games edit type - winOrLose', async () => {
            const game01: IGame = {
                gameId: 'test_game',
                name: 'Test Game',
                gameType: 'free',
                lowerScoreWins: false,
                players: [],
            };
            await GamesService.addGame(game01);

            await GamesService.updateGamePlayer(game01.gameId, 0, 'New player 0');
            await GamesService.updateGamePlayer(game01.gameId, 1, 'New player 1');

            await GamesService.updateGameScore(game01.gameId, 0, 0, 1);
            await GamesService.updateGameScore(game01.gameId, 0, 1, 7);
            await GamesService.updateGameScore(game01.gameId, 1, 0, 9);

            const game01bis = await GamesService.updateGameType(game01.gameId, 'winOrLose');
            expect(game01bis && game01bis.gameType).toEqual('winOrLose');
            expect(game01bis && game01bis.players[0].scores).toEqual([1, 1]);
            expect(game01bis && game01bis.players[1].scores).toEqual([1, 0]);
        });
    });
});
