import {Router} from 'express';
import {GamesService} from './games.service';
import {
    IGame,
    IGameEditName,
    IGameEditPlayer,
    IGameEditScore,
    IGameEditWin,
    IGameRemovePlayer,
    IGameRemoveScore,
    pickIGame
} from '../model/game';
import {generateToken} from '../utils/generate-token';

interface ParamsDictionary {
    [key: string]: string;
}

interface WithError<T> {
    result: T | null;
    error: string;
}

const router = Router();

router.post<ParamsDictionary, WithError<IGame>, IGame>('/new-game', (request, response) => {
    const gameId = generateToken(8);
    GamesService.addGame({...request.body, gameId})
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in POST /games/new-game', err);
            response.status(500).send({result: null, error: err.toString()});
        });
});

router.get<{ gameId: string }, WithError<IGame>>('/game/:gameId', (request, response) => {
    const gameId = request.params.gameId;
    GamesService.getGameById(gameId)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn(`Error in GET /games/game/${gameId}`, err);
            response.status(500).send({result: null, error: err.toString()});
        });
});

router.get<ParamsDictionary, WithError<IGame[]>>('/games', (request, response) => {
    GamesService.getGames()
        .then(games => response.send({result: games, error: ''}))
        .catch(err => {
            console.warn('Error in GET /games/games', err);
            response.status(500).send({result: [], error: err.toString()});
        });
});

router.put<{ gameId: string }, WithError<IGame>, IGame>('/game/:gameId', (request, response) => {
    const gameId = request.params.gameId;
    if (gameId !== request.body.gameId) {
        response.status(400).send({result: null, error: 'Game ID mismatch'});
        return;
    }
    GamesService.updateGame(pickIGame(request.body))
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn(`Error in PUT /games/game/${gameId}`, err);
            response.status(500).send({result: null, error: err.toString()});
        });
});

router.delete<{ gameId: string }, WithError<null>>('/game/:gameId', (request, response) => {
    const gameId = request.params.gameId;

    GamesService.deleteGame(gameId)
        .then(() => response.send({result: null, error: ''}))
        .catch(err => {
            console.warn(`Error in DELETE /games/game/${gameId}`, err);
            response.status(500).send({result: null, error: err.toString()});
        });
});

router.post<ParamsDictionary, WithError<IGame>, IGameEditName>('/game-edit/name', (request, response) => {
    const edit = request.body;
    GamesService.updateGameName(edit.gameId, edit.name)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in POST /games/game-edit/name', err);
            response.status(500).send({result: null, error: err.toString()});
        });
});

router.post<ParamsDictionary, WithError<IGame>, IGameEditWin>('/game-edit/win', (request, response) => {
    const edit = request.body;
    GamesService.updateGameWin(edit.gameId, edit.lowerScoreWins)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in POST /games/game-edit/win', err);
            response.status(500).send({result: null, error: err.toString()});
        });
});

router.post<ParamsDictionary, WithError<IGame>, IGameEditPlayer>('/game-edit/player', (request, response) => {
    const edit = request.body;
    GamesService.updateGamePlayer(edit.gameId, edit.playerId, edit.playerName)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in POST /games/game-edit/player', err);
            response.status(500).send({result: null, error: err.toString()});
        });
});

router.delete<ParamsDictionary, WithError<IGame>, IGameRemovePlayer>('/game-edit/player', (request, response) => {
    const edit = request.body;
    GamesService.removeGamePlayer(edit.gameId, edit.playerId)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in DELETE /games/game-edit/player', err);
            response.status(500).send({result: null, error: err.toString()});
        });
});

router.post<ParamsDictionary, WithError<IGame>, IGameEditScore>('/game-edit/score', (request, response) => {
    const edit = request.body;
    GamesService.updateGameScore(edit.gameId, edit.playerId, edit.scoreId, edit.score)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in POST /games/game-edit/score', err);
            response.status(500).send({result: null, error: err.toString()});
        });
});

router.delete<ParamsDictionary, WithError<IGame>, IGameRemoveScore>('/game-edit/score', (request, response) => {
    const edit = request.body;
    GamesService.removeGameScore(edit.gameId, edit.playerId, edit.scoreId)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in DELETE /games/game-edit/score', err);
            response.status(500).send({result: null, error: err.toString()});
        });
});

export default router;
