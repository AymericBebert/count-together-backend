import {Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {Socket} from 'socket.io';
import {emitEvent, EmittedEventTypes, fromEventTyped, ReceivedEventTypes} from '../events';
import {GamesService} from '../games/games.service';
import {GameHotel} from '../live/game-hotel';

export function onConnection(socket: Socket<ReceivedEventTypes, EmittedEventTypes>, hotel: GameHotel): void {
    console.log(`New connection from ${socket.id}`);
    const exited$ = new Subject<void>();

    fromEventTyped(socket, 'game join').subscribe(async gameId => {

        const added = await hotel.addConnection(socket, gameId);
        if (!added) {
            return;
        }

        fromEventTyped(socket, 'game update')
            .pipe(takeUntil(exited$))
            .subscribe(game => GamesService.updateGame(game)
                .then(newGame => hotel.updateGame(newGame))
                .catch(err => {
                    hotel.sendGame(socket, game.gameId);
                    emitEvent(socket, 'display error', err.toString());
                }),
            );

        fromEventTyped(socket, 'game delete')
            .pipe(filter(gid => gid === gameId), takeUntil(exited$))
            .subscribe(gid => GamesService.deleteGame(gid)
                .then(() => hotel.deleteGame(gid))
                .catch(err => {
                    hotel.sendGame(socket, gid);
                    emitEvent(socket, 'display error', err.toString());
                }),
            );

        fromEventTyped(socket, 'game edit name')
            .pipe(takeUntil(exited$))
            .subscribe(edit => GamesService.updateGameName(edit.gameId, edit.name)
                .then(newGame => hotel.updateGame(newGame))
                .catch(err => {
                    hotel.sendGame(socket, edit.gameId);
                    emitEvent(socket, 'display error', err.toString());
                }),
            );

        fromEventTyped(socket, 'game edit win')
            .pipe(takeUntil(exited$))
            .subscribe(edit => GamesService.updateGameWin(edit.gameId, edit.lowerScoreWins)
                .then(newGame => hotel.updateGame(newGame))
                .catch(err => {
                    hotel.sendGame(socket, edit.gameId);
                    emitEvent(socket, 'display error', err.toString());
                }),
            );

        fromEventTyped(socket, 'game edit type')
            .pipe(takeUntil(exited$))
            .subscribe(edit => GamesService.updateGameType(edit.gameId, edit.gameType)
                .then(newGame => hotel.updateGame(newGame))
                .catch(err => {
                    hotel.sendGame(socket, edit.gameId);
                    emitEvent(socket, 'display error', err.toString());
                }),
            );

        fromEventTyped(socket, 'game edit player')
            .pipe(takeUntil(exited$))
            .subscribe(edit => GamesService.updateGamePlayer(edit.gameId, edit.playerId, edit.playerName)
                .then(newGame => hotel.updateGame(newGame))
                .catch(err => {
                    hotel.sendGame(socket, edit.gameId);
                    emitEvent(socket, 'display error', err.toString());
                }),
            );

        fromEventTyped(socket, 'game remove player')
            .pipe(takeUntil(exited$))
            .subscribe(edit => GamesService.removeGamePlayer(edit.gameId, edit.playerId)
                .then(newGame => hotel.updateGame(newGame))
                .catch(err => {
                    hotel.sendGame(socket, edit.gameId);
                    emitEvent(socket, 'display error', err.toString());
                }),
            );

        fromEventTyped(socket, 'game edit score')
            .pipe(takeUntil(exited$))
            .subscribe(edit => GamesService.updateGameScore(edit.gameId, edit.playerId, edit.scoreId, edit.score)
                .then(newGame => hotel.updateGame(newGame))
                .catch(err => {
                    hotel.sendGame(socket, edit.gameId);
                    emitEvent(socket, 'display error', err.toString());
                }),
            );

        fromEventTyped(socket, 'game remove score')
            .pipe(takeUntil(exited$))
            .subscribe(edit => GamesService.removeGameScore(edit.gameId, edit.playerId, edit.scoreId)
                .then(newGame => hotel.updateGame(newGame))
                .catch(err => {
                    hotel.sendGame(socket, edit.gameId);
                    emitEvent(socket, 'display error', err.toString());
                }),
            );

        fromEventTyped(socket, 'disconnect')
            .pipe(takeUntil(exited$))
            .subscribe(() => {
                exited$.next();
                hotel.removeConnection(socket, gameId).catch(err => console.error('removeConnection error:', err));
            });

        fromEventTyped(socket, 'game exit')
            .pipe(takeUntil(exited$))
            .subscribe(() => {
                exited$.next();
                hotel.removeConnection(socket, gameId).catch(err => console.error('removeConnection error:', err));
            });
    });
}
