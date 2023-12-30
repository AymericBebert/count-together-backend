import {Router} from 'express';
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
import {errorString} from '../utils/error-string';
import {generateToken} from '../utils/generate-token';
import {GamesService} from './games.service';

type NoParams = Record<string, never>

interface WithError<T> {
    result: T | null;
    error: string;
}

const router = Router();

router.post<NoParams, WithError<Game>, Game>('/new-game', (request, response) => {
    const gameId = generateToken(8);
    GamesService.addGame({...request.body, gameId})
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in POST /games/new-game', err);
            response.status(500).send({result: null, error: errorString(err)});
        });
});

router.post<{ gameId: string }, WithError<Game>>('/duplicate/:gameId', (request, response) => {
    const gameId = request.params.gameId;
    GamesService.duplicateGame(gameId)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn(`Error in POST /duplicate/${gameId}`, err);
            response.status(500).send({result: null, error: errorString(err)});
        });
});

router.get<{ gameId: string }, WithError<Game>>('/game/:gameId', (request, response) => {
    const gameId = request.params.gameId;
    GamesService.getGameById(gameId)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn(`Error in GET /games/game/${gameId}`, err);
            response.status(500).send({result: null, error: errorString(err)});
        });
});

// router.get<NoParams, WithError<IGame[]>>('/games', (request, response) => {
//     GamesService.getGames()
//         .then(games => response.send({result: games, error: ''}))
//         .catch(err => {
//             console.warn('Error in GET /games/games', err);
//             response.status(500).send({result: [], error: errorString(err)});
//         });
// });

router.put<{ gameId: string }, WithError<Game>, Game>('/game/:gameId', (request, response) => {
    const gameId = request.params.gameId;
    if (gameId !== request.body.gameId) {
        response.status(400).send({result: null, error: 'Game ID mismatch'});
        return;
    }
    GamesService.updateGame(pickGame(request.body))
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn(`Error in PUT /games/game/${gameId}`, err);
            response.status(500).send({result: null, error: errorString(err)});
        });
});

router.delete<{ gameId: string }, WithError<null>>('/game/:gameId', (request, response) => {
    const gameId = request.params.gameId;

    GamesService.deleteGame(gameId)
        .then(() => response.send({result: null, error: ''}))
        .catch(err => {
            console.warn(`Error in DELETE /games/game/${gameId}`, err);
            response.status(500).send({result: null, error: errorString(err)});
        });
});

router.post<NoParams, WithError<Game>, GameEditName>('/game-edit/name', (request, response) => {
    const edit = request.body;
    GamesService.updateGameName(edit.gameId, edit.name)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in POST /games/game-edit/name', err);
            response.status(500).send({result: null, error: errorString(err)});
        });
});

router.post<NoParams, WithError<Game>, GameEditGameType>('/game-edit/type', (request, response) => {
    const edit = request.body;
    GamesService.updateGameType(edit.gameId, edit.gameType)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in POST /games/game-edit/type', err);
            response.status(500).send({result: null, error: errorString(err)});
        });
});

router.post<NoParams, WithError<Game>, GameEditWin>('/game-edit/win', (request, response) => {
    const edit = request.body;
    GamesService.updateGameWin(edit.gameId, edit.lowerScoreWins)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in POST /games/game-edit/win', err);
            response.status(500).send({result: null, error: errorString(err)});
        });
});

router.post<NoParams, WithError<Game>, GameEditPlayer>('/game-edit/player', (request, response) => {
    const edit = request.body;
    GamesService.updateGamePlayer(edit.gameId, edit.playerId, edit.playerName)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in POST /games/game-edit/player', err);
            response.status(500).send({result: null, error: errorString(err)});
        });
});

router.delete<NoParams, WithError<Game>, GameRemovePlayer>('/game-edit/player', (request, response) => {
    const edit = request.body;
    GamesService.removeGamePlayer(edit.gameId, edit.playerId)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in DELETE /games/game-edit/player', err);
            response.status(500).send({result: null, error: errorString(err)});
        });
});

router.post<NoParams, WithError<Game>, GameEditScore>('/game-edit/score', (request, response) => {
    const edit = request.body;
    GamesService.updateGameScore(edit.gameId, edit.playerId, edit.scoreId, edit.score)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in POST /games/game-edit/score', err);
            response.status(500).send({result: null, error: errorString(err)});
        });
});

router.delete<NoParams, WithError<Game>, GameRemoveScore>('/game-edit/score', (request, response) => {
    const edit = request.body;
    GamesService.removeGameScore(edit.gameId, edit.playerId, edit.scoreId)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in DELETE /games/game-edit/score', err);
            response.status(500).send({result: null, error: errorString(err)});
        });
});

export default router;
