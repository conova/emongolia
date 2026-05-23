import express from 'express';
import * as publicController from '../../controllers/public.controller';

const router = express.Router();

router.route('/').get(publicController.homeAction);

router.route('/health').get(publicController.healthCheck);

router.route('/result').get(publicController.result);

router.route('/base-exception').get(publicController.baseExceptionThrower);

router.route('/invalid-param-exception').get(publicController.invalidParamExceptionThrower);

router.route('/exception').get(publicController.exceptionThrower);

router.route('/favicon.ico').get(publicController.ignoreFavicon);

export default router;
