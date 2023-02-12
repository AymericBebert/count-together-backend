import express, {NextFunction} from 'express';

export const loggerMiddleware = (request: express.Request, response: express.Response, next: NextFunction): void => {
    const bodyStr = JSON.stringify(request.body);
    console.log(`http> ${request.method}`
        + ` - ${request.path}`
        + ` - query ${JSON.stringify(request.query)}`
        + ` - body ${bodyStr.length > 2000 ? bodyStr.slice(0, 2000) + '[...]' : bodyStr}`);
    next();
};
