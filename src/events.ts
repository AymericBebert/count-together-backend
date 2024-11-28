import {fromEvent, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Socket} from 'socket.io';
import {config} from './config';
import {Game} from './model/game';
import {
    GameEditGameType,
    GameEditName,
    GameEditPlayer,
    GameEditScore,
    GameEditWin,
    GameRemovePlayer,
    GameRemoveScore
} from './model/game-edit-dtos';

export interface ReceivedEventTypes {
    'disconnect': void;
    'game join': string;
    'game exit': void;
    'game update': Game;
    'game delete': string;
    'game edit name': GameEditName;
    'game edit win': GameEditWin;
    'game edit type': GameEditGameType;
    'game edit player': GameEditPlayer;
    'game remove player': GameRemovePlayer;
    'game edit score': GameEditScore;
    'game remove score': GameRemoveScore;
}

export interface EmittedEventTypes {
    'game joined': string;
    'game exited': string;
    'game': Game;
    'game deleted': string;
    'display error': string;
}

export function fromEventTyped<T extends keyof ReceivedEventTypes>(
    target: Socket<ReceivedEventTypes, any>,
    eventName: T,
): Observable<ReceivedEventTypes[T]> {
    return (fromEvent(target, eventName) as Observable<ReceivedEventTypes[T]>).pipe(
        tap(data => config.debugSocket && console.log(`socket> ${eventName}: ${JSON.stringify(data)}`)),
    );
}

export function emitEvent<T extends keyof EmittedEventTypes>(
    emitter: Socket<any, EmittedEventTypes>,
    eventName: T,
    ...data: EmittedEventTypes[T][]
): void {
    if (config.debugSocket) {
        console.log(`socket< ${eventName}: ${JSON.stringify(data[0])?.substring(0, 999)}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    emitter.emit(eventName, ...(data as any));
}
