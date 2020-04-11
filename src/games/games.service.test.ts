import {GamesService} from './games.service';
// import {connectMongooseWithRetry} from '../utils/mongodb-connect';
import {connectMongooseWithRetry} from '../tests/mongodb-memory-connect';

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

    describe('Company service tests', () => {

        it('games CRUD', async () => {
            const game01 = {
                gameId: 'test_game',
                name: 'Test Game',
                lowerScoreWins: false,
                players: [],
            };

            const game01bis = await GamesService.addGame(game01);
            expect(game01bis).toEqual(game01);

            const game01ter = await GamesService.addGame(game01)
                .catch(() => console.log('[OK] games add game01ter error'));
            expect(game01ter).toBeFalsy();

            await GamesService.updateGame({...game01, name: 'Test Game Updated'});
            const game02 = await GamesService.getGameById(game01.gameId);
            expect(game02 && game02.name).toEqual('Test Game Updated');

            const allGames = await GamesService.getGames();
            const testGames = allGames.filter(g => g.gameId.startsWith('test_'));
            expect(testGames.length).toEqual(1);

            await GamesService.deleteGame(game01.gameId);
            const allGames2 = await GamesService.getGames();
            const testGames2 = allGames2.filter(g => g.gameId.startsWith('test_'));
            expect(testGames2.length).toEqual(0);
        });
    });
});
