import {
    NextFunction,
    ParamsArray,
    ParamsDictionary,
    Request,
    RequestHandler,
    Response,
} from 'express-serve-static-core';
import {ParsedQs} from 'qs';

export const asyncHandler = <P extends ParamsDictionary | ParamsArray = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    Locals extends Record<string, any> = Record<string, any>,
>(fn: RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>) => function asyncUtilWrap(
    req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
    res: Response<ResBody, Locals>,
    next: NextFunction,
) {
    const fnReturn = fn(req, res, next);
    return Promise.resolve(fnReturn).catch(next);
};
