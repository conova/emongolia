import { Request, Response, NextFunction } from 'express';
import { AsyncFunction } from './types';

const catchAsync = (fn: AsyncFunction) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

export default catchAsync;
