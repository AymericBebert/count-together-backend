import {ErrorRequestHandler} from 'express';
import {errorString} from '../utils/error-string';
import {hasOwnProperty} from '../utils/property';
import {HttpError} from './http-error';

export const customErrorHandler: ErrorRequestHandler =
    (err, req, res) => {
        if (res.headersSent && err instanceof Error) {
            console.error('httpError> headers sent with', res.statusCode, err.message);
            if (hasOwnProperty(err, 'customDetails')) {
                console.error('httpError>> error details:', err.customDetails);
            }
            return;
        }
        if (err instanceof HttpError) {
            console.error('httpError> responding with HttpError', err.code, err.message);
            if (err.customDetails) {
                console.error('httpError>> error details:', err.customDetails);
            }
            return res.status(err.code).send(err.message);
        }
        if (err instanceof Error && err.name === 'PayloadTooLargeError') {
            console.log(`http> ${req.method} - ${req.path}`);
            console.error('httpError> responding with HttpError', 413, err.message);
            return res.status(413).send(err.message);
        }
        console.error(
            'httpError> other error:',
            err instanceof Error && hasOwnProperty(err, 'stack') ? err.stack : errorString(err),
        );
        return res.status(500).send();
    };
