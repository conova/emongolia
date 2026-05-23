import express from 'express';

import validate from '../../middlewares/validate';
import ServiceController from '../../controllers/service.controller';
import * as eValidation from '../../validations/emongolia.validation';
import { injectable } from 'tsyringe';


@injectable()
export default class ServiceRoute {
    private readonly controller: ServiceController;
    private _router = express.Router();

    constructor(serviceController: ServiceController) {
        this.controller = serviceController;
    }

    public get router() {
        this._router
            .route('/services')
            .get(validate(eValidation.serviceList), this.controller.getServiceList);
        this._router
            .route('/service')
            .post(validate(eValidation.createService), this.controller.createService);
        this._router
            .route('/service/:code')
            .get(validate(eValidation.serviceCode), this.controller.getService);
        this._router
            .route('/service/:code')
            .put(
                validate(eValidation.serviceCode),
                validate(eValidation.updateService),
                this.controller.updateService
            );
        this._router
            .route('/service/:code')
            .delete(validate(eValidation.serviceCode), this.controller.removeService);

        return this._router;
    }
}
