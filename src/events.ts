import {fromEvent, Observable} from 'rxjs';
import {FromEventTarget} from 'rxjs/internal/observable/fromEvent';
import {tap} from 'rxjs/operators';
import {IGame} from './model/game';

export interface ReceivedEventTypes {
    'disconnect': void;
    'game join': string;
    'game exit': void;
    'game update': IGame;
    'game delete': string;
}

export interface EmittedEventTypes {
    'game joined': string;
    'game exited': string;
    'game': IGame;
    'game deleted': string;
}

export function fromEventTyped<T extends keyof ReceivedEventTypes>(
    target: FromEventTarget<ReceivedEventTypes[T]>,
    eventName: T,
): Observable<ReceivedEventTypes[T]> {
    return fromEvent(target, eventName)
        .pipe(tap(data => process.env.DEBUG_SOCKET && console.log(`socket> ${eventName}: ${JSON.stringify(data)}`)));
}

export function emitEvent<T extends keyof EmittedEventTypes>(
    emitter: NodeJS.EventEmitter,
    eventName: T,
    ...data: Array<EmittedEventTypes[T]>
): void {
    if (process.env.DEBUG_SOCKET) {
        console.log(`socket< ${eventName}: ${JSON.stringify(data[0])?.substr(0, 999)}`);
    }
    emitter.emit(eventName, ...data);
}
