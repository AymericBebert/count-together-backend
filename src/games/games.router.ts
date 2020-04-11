import {Request, Router} from 'express';
import {GamesService} from './games.service';
import {IGame, pickIGame} from '../model/game';
import {generateToken} from '../utils/generate-token';

interface Body<T> extends Request {
    body: T;
}

const router = Router();

// addGame(game: IGame): Promise<IGame> {
router.post('/new-game', (request: Body<IGame>, response) => {
    const gameId = generateToken(8);
    GamesService.addGame({...request.body, gameId})
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn('Error in POST /games/new-game');
            response.status(500).send({result: null, error: err.toString()});
        });
});

// getGameById(gameId: string): Promise<IGame | null> {
router.get('/game/:gameId', (request, response) => {
    const gameId = request.params.gameId;
    GamesService.getGameById(gameId)
        .then(game => response.send({result: game, error: ''}))
        .catch(err => {
            console.warn(`Error in GET /games/game/${gameId}`);
            response.status(500).send({result: null, error: err.toString()});
        });
});

// getGames(): Promise<IGame[]> {
router.get('/games', (request, response) => {
    GamesService.getGames()
        .then(games => response.send({result: games, error: ''}))
        .catch(err => {
            console.warn('Error in GET /games/games');
            response.status(500).send({result: [], error: err.toString()});
        });
});

// updateGame(game: IGame): Promise<IGame> {
router.put('/game/:gameId', (request: Body<IGame>, response) => {
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

// deleteGame(gameId: string): Promise<void> {
router.delete('/game/:gameId', (request, response) => {
    const gameId = request.params.gameId;

    GamesService.deleteGame(gameId)
        .then(() => response.send({error: ''}))
        .catch(err => {
            console.warn(`Error in DELETE /games/game/${gameId}`);
            response.status(500).send({error: err.toString()});
        });
});

export default router;
