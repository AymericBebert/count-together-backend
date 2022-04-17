import {fromEvent, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Socket} from 'socket.io';
import {config} from './config';
import {
    IGame,
    IGameEditGameType,
    IGameEditName,
    IGameEditPlayer,
    IGameEditScore,
    IGameEditWin,
    IGameRemovePlayer,
    IGameRemoveScore,
} from './model/game';

export interface ReceivedEventTypes {
    'disconnect': void;
    'game join': string;
    'game exit': void;
    'game update': IGame;
    'game delete': string;
    'game edit name': IGameEditName;
    'game edit win': IGameEditWin;
    'game edit type': IGameEditGameType;
    'game edit player': IGameEditPlayer;
    'game remove player': IGameRemovePlayer;
    'game edit score': IGameEditScore;
    'game remove score': IGameRemoveScore;
}

export interface EmittedEventTypes {
    'game joined': string;
    'game exited': string;
    'game': IGame;
    'game deleted': string;
    'display error': string;
}

export function fromEventTyped<T extends keyof ReceivedEventTypes>(
    target: Socket<ReceivedEventTypes, any>,
    eventName: T,
): Observable<ReceivedEventTypes[T]> {
    return fromEvent<ReceivedEventTypes[T]>(target, eventName).pipe(
        tap(data => config.debugSocket && console.log(`socket> ${eventName}: ${JSON.stringify(data)}`)),
    );
}

export function emitEvent<T extends keyof EmittedEventTypes>(
    emitter: Socket<any, EmittedEventTypes>,
    eventName: T,
    ...data: EmittedEventTypes[T][]
): void {
    if (config.debugSocket) {
        console.log(`socket< ${eventName}: ${JSON.stringify(data[0])?.substr(0, 999)}`);
    }
    emitter.emit(eventName, ...(data as any));
}
