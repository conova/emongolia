import apm from 'elastic-apm-node';

apm.start({
    serviceName: 'emongolia',
    secretToken: process.env.APM_SECRET_TOKEN,
    serverUrl: process.env.ELASTIC_URL,
    active: process.env.NODE_ENV === 'prod',
});

import 'reflect-metadata';

import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import httpStatus from 'http-status';
import compression from 'compression';
import cors from 'cors';
import bodyParser from 'body-parser';

import { container } from 'tsyringe';

import config from '../config/config';
import morgan from '../config/morgan';
import routes from './routes/index';

import BaseException from './exception/BaseException';

import { errorHandler } from './middlewares/error';

const app: Express = express();

if (config.env !== 'test') {
    app.use(morgan.successHandler);
    app.use(morgan.errorHandler);
}

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// set security HTTP headers
app.use(helmet());
app.use(helmet.xssFilter());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// gzip compression
app.use(compression());

// enable cors
app.use(cors());

// api routes
app.use('/', routes);

// send back a 404 error for any unknown api request
app.use((req: Request, res: Response, next: NextFunction) => {
    next(new BaseException('Not found', httpStatus.NOT_FOUND));
});

// handle error
app.use(errorHandler);

export default app;
