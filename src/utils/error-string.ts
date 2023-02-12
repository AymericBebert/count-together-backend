import {HttpError} from '../error/http-error';

export function errorString(err: unknown): string {
    if (err instanceof HttpError && err.customDetails) {
        return `${err.code}: ${err.message} >> ${err.customDetails}`;
    }
    if (err instanceof Error) {
        return err.toString();
    }
    return `<Error of type ${typeof err}>`;
}
