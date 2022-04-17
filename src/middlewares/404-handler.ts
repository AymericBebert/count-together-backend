import {RequestHandler} from 'express';

export const handle404: RequestHandler = (req, res, next): void => {
    if (!res.headersSent) {
        console.error('httpError> responding with HttpError', 404, 'Not Found');
        console.error('httpError>> error details:', `No response for: ${req.path}`);
        res.status(404).send('Not Found');
        return;
    }
    next();
};
