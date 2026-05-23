import express from 'express';
import { injectable } from 'tsyringe';

import validate from '../../middlewares/validate';
import eMongoliaController from '../../controllers/emongolia.controller';
import * as eValidation from '../../validations/emongolia.validation';

@injectable()
export default class EMongoliaRoute {
    private readonly _controller: eMongoliaController;
    private readonly authenticator: Authentication;
    private _router = express.Router();

    constructor(eMongoliaController: eMongoliaController, authentication: Authentication) {
        this._controller = eMongoliaController;
        this.authenticator = authentication;
    }

    public get router() {
        this._router.route('/redirect/:requestId').get(this._controller.redirect);
        this._router
            .route('/uri')
            .post(validate(eValidation.getUri), this._controller.getUri);
        this._router
            .route('/check')
            .get(validate(eValidation.checkRequest), this._controller.requestStatus);
        return this._router;
    }
}
