import {Router} from 'express';
import {GamesService} from './games.service';
import {IGame, pickIGame} from '../model/game';
import {generateToken} from '../utils/generate-token';

interface WithError<T> {
    result: T | null;
    error: string;
}

const router = Router();

router.post<void, WithError<IGame>, IGame>('/new-game', (request, response) => {
    const gameId = generateToken(8);
    GamesService.addGame({...request.body, gameId})
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in POST /games/new-game');
            response.status(500).send({result: null, error: err.toString()});
        });
});

router.get<{ gameId: string }, WithError<IGame>>('/game/:gameId', (request, response) => {
    const gameId = request.params.gameId;
    GamesService.getGameById(gameId)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn(`Error in GET /games/game/${gameId}`);
            response.status(500).send({result: null, error: err.toString()});
        });
});

router.get<void, WithError<IGame[]>>('/games', (request, response) => {
    GamesService.getGames()
        .then(games => response.send({result: games, error: ''}))
        .catch(err => {
            console.warn('Error in GET /games/games');
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
            console.warn(`Error in PUT /games/game/${gameId}`);
            response.status(500).send({result: null, error: err.toString()});
        });
});

router.delete<{ gameId: string }, WithError<null>>('/game/:gameId', (request, response) => {
    const gameId = request.params.gameId;

    GamesService.deleteGame(gameId)
        .then(() => response.send({result: null, error: ''}))
        .catch(err => {
            console.warn(`Error in DELETE /games/game/${gameId}`);
            response.status(500).send({result: null, error: err.toString()});
        });
});

export default router;
