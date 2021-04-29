import {Router} from 'express';
import {GamesService} from './games.service';
import {
    IGame,
    IGameEditGameType,
    IGameEditName,
    IGameEditPlayer,
    IGameEditScore,
    IGameEditWin,
    IGameRemovePlayer,
    IGameRemoveScore,
    pickIGame
} from '../model/game';
import {generateToken} from '../utils/generate-token';

interface WithError<T> {
    result: T | null;
    error: string;
}

const router = Router();

router.post<{}, WithError<IGame>, IGame>('/new-game', (request, response) => {
    const gameId = generateToken(8);
    GamesService.addGame({...request.body, gameId})
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in POST /games/new-game', err);
            response.status(500).send({result: null, error: err.toString()});
        });
});

router.post<{ gameId: string }, WithError<IGame>>('/duplicate/:gameId', (request, response) => {
    const gameId = request.params.gameId;
    const newGameId = generateToken(8);
    GamesService.getGameById(gameId)
        .then(game => {
            if (!game) {
                throw new Error('Cannot copy: did not find game');
            }
            return GamesService.addGame({...game, gameId: newGameId, name: game.name + ' - copy'});
        })
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn(`Error in POST /duplicate/${gameId}`, err);
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

// router.get<{}, WithError<IGame[]>>('/games', (request, response) => {
//     GamesService.getGames()
//         .then(games => response.send({result: games, error: ''}))
//         .catch(err => {
//             console.warn('Error in GET /games/games', err);
//             response.status(500).send({result: [], error: err.toString()});
//         });
// });

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

router.post<{}, WithError<IGame>, IGameEditName>('/game-edit/name', (request, response) => {
    const edit = request.body;
    GamesService.updateGameName(edit.gameId, edit.name)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in POST /games/game-edit/name', err);
            response.status(500).send({result: null, error: err.toString()});
        });
});

router.post<{}, WithError<IGame>, IGameEditGameType>('/game-edit/type', (request, response) => {
    const edit = request.body;
    GamesService.updateGameType(edit.gameId, edit.gameType)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in POST /games/game-edit/type', err);
            response.status(500).send({result: null, error: err.toString()});
        });
});

router.post<{}, WithError<IGame>, IGameEditWin>('/game-edit/win', (request, response) => {
    const edit = request.body;
    GamesService.updateGameWin(edit.gameId, edit.lowerScoreWins)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in POST /games/game-edit/win', err);
            response.status(500).send({result: null, error: err.toString()});
        });
});

router.post<{}, WithError<IGame>, IGameEditPlayer>('/game-edit/player', (request, response) => {
    const edit = request.body;
    GamesService.updateGamePlayer(edit.gameId, edit.playerId, edit.playerName)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in POST /games/game-edit/player', err);
            response.status(500).send({result: null, error: err.toString()});
        });
});

router.delete<{}, WithError<IGame>, IGameRemovePlayer>('/game-edit/player', (request, response) => {
    const edit = request.body;
    GamesService.removeGamePlayer(edit.gameId, edit.playerId)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in DELETE /games/game-edit/player', err);
            response.status(500).send({result: null, error: err.toString()});
        });
});

router.post<{}, WithError<IGame>, IGameEditScore>('/game-edit/score', (request, response) => {
    const edit = request.body;
    GamesService.updateGameScore(edit.gameId, edit.playerId, edit.scoreId, edit.score)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in POST /games/game-edit/score', err);
            response.status(500).send({result: null, error: err.toString()});
        });
});

router.delete<{}, WithError<IGame>, IGameRemoveScore>('/game-edit/score', (request, response) => {
    const edit = request.body;
    GamesService.removeGameScore(edit.gameId, edit.playerId, edit.scoreId)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in DELETE /games/game-edit/score', err);
            response.status(500).send({result: null, error: err.toString()});
        });
});

export default router;
