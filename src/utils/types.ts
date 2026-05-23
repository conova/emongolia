import { Request, Response, NextFunction } from 'express';

export type UnknownObject = {
    [key: string]: any;
};

export type AsyncFunction = (req: Request, res: Response, next: NextFunction) => void;

export type DataType = {
    name: string;
    content: string;
    updatedUserId?: number;
};
