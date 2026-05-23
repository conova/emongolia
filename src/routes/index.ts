import express from 'express';

import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

import config from '../../config/config';
import prisma from '../utils/prisma';

import EMongoliaRoute from './api/emongolia.route';
import AuthorizeRoute from './api/authorize.route';
import ServiceRoute from './api/service.route';
import publicRoute from '../routes/public/public.route';
import docsRoute from '../../docs/docs.route';

const router = express.Router();

container.register<PrismaClient>('PrismaClient', { useValue: prisma });

const defaultRoutes = [
    {
        path: '/api/e',
        route: container.resolve(EMongoliaRoute).router,
    },
    {
        path: '/api/s',
        route: container.resolve(ServiceRoute).router,
    },
    {
        path: '/',
        route: container.resolve(AuthorizeRoute).router,
    },
    {
        path: '/',
        route: publicRoute,
    },
];

const devRoutes = [
    {
        path: '/docs',
        route: docsRoute,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

if (config.env === 'dev') {
    devRoutes.forEach((route) => {
        router.use(route.path, route.route);
    });
}

export default router;
