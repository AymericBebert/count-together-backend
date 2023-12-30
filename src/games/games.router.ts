import {Router} from 'express';
import {HttpError} from '../error/http-error';
import {Game, pickGame,} from '../model/game';
import {
    GameEditGameType,
    GameEditName,
    GameEditPlayer,
    GameEditScore,
    GameEditWin,
    GameRemovePlayer,
    GameRemoveScore
} from '../model/game-edit-dtos';
import {asyncHandler} from '../utils/async-handler';
import {generateToken} from '../utils/generate-token';
import {GamesService} from './games.service';

type NoParams = Record<string, never>

const router = Router();

router.post<NoParams, Game, Game>(
    '/new-game',
    asyncHandler(async (request, response) => {
        const gameId = generateToken(8);
        const game = await GamesService.addGame({...request.body, gameId});
        response.send(game);
    }),
);

router.post<{ gameId: string }, Game>(
    '/duplicate/:gameId',
    asyncHandler(async (request, response) => {
        const gameId = request.params.gameId;
        const game = await GamesService.duplicateGame(gameId);
        response.send(game);
    }),
);

router.get<{ gameId: string }, Game | null, NoParams, { notFoundOk: string }>(
    '/game/:gameId',
    asyncHandler(async (request, response, next) => {
        const gameId = request.params.gameId;
        const notFoundOk = request.query.notFoundOk !== 'false';
        const game = await GamesService.getGameById(gameId);
        if (game) {
            response.send(game);
        } else if (notFoundOk) {
            response.send(null);
        } else {
            next(new HttpError(404, `Game ${gameId} not found`));
        }
    }),
);

// router.get<NoParams, Game[]>(
//     '/games',
//     asyncHandler(async (request, response) => {
//         const games = await GamesService.getGames();
//         response.send(games);
//     }),
// );

router.put<{ gameId: string }, Game, Game>(
    '/game/:gameId',
    asyncHandler(async (request, response, next) => {
        const gameId = request.params.gameId;
        if (gameId !== request.body.gameId) {
            return next(new HttpError(404, `Game ID mismatch: ${gameId} !== ${request.body.gameId}`));
        }
        const game = await GamesService.updateGame(pickGame(request.body));
        response.send(game);
    }),
);

router.delete<{ gameId: string }, void>(
    '/game/:gameId',
    asyncHandler(async (request, response) => {
        const gameId = request.params.gameId;
        await GamesService.deleteGame(gameId);
        response.send();
    }),
);

router.post<NoParams, Game, GameEditName>(
    '/game-edit/name',
    asyncHandler(async (request, response) => {
        const edit = request.body;
        const game = await GamesService.updateGameName(edit.gameId, edit.name);
        response.send(game);
    }),
);

router.post<NoParams, Game, GameEditGameType>(
    '/game-edit/type',
    asyncHandler(async (request, response) => {
        const edit = request.body;
        const game = await GamesService.updateGameType(edit.gameId, edit.gameType);
        response.send(game);
    }),
);

router.post<NoParams, Game, GameEditWin>(
    '/game-edit/win',
    asyncHandler(async (request, response) => {
        const edit = request.body;
        const game = await GamesService.updateGameWin(edit.gameId, edit.lowerScoreWins);
        response.send(game);
    }),
);

router.post<NoParams, Game, GameEditPlayer>(
    '/game-edit/player',
    asyncHandler(async (request, response) => {
        const edit = request.body;
        const game = await GamesService.updateGamePlayer(edit.gameId, edit.playerId, edit.playerName);
        response.send(game);
    }),
);

router.delete<NoParams, Game, GameRemovePlayer>(
    '/game-edit/player',
    asyncHandler(async (request, response) => {
        const edit = request.body;
        const game = await GamesService.removeGamePlayer(edit.gameId, edit.playerId);
        response.send(game);
    }),
);

router.post<NoParams, Game, GameEditScore>(
    '/game-edit/score',
    asyncHandler(async (request, response) => {
        const edit = request.body;
        const game = await GamesService.updateGameScore(edit.gameId, edit.playerId, edit.scoreId, edit.score);
        response.send(game);
    }),
);

router.delete<NoParams, Game, GameRemoveScore>(
    '/game-edit/score',
    asyncHandler(async (request, response) => {
        const edit = request.body;
        const game = await GamesService.removeGameScore(edit.gameId, edit.playerId, edit.scoreId);
        response.send(game);
    }),
);

export default router;
