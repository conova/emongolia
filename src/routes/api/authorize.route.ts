import express from 'express';
import { injectable } from 'tsyringe';

import eMongoliaController from '../../controllers/emongolia.controller';

@injectable()
export default class EMongoliaRoute {
    private readonly _controller: eMongoliaController;
    private _router = express.Router();

    constructor(eMongoliaController: eMongoliaController) {
        this._controller = eMongoliaController;
    }

    public get router() {
        this._router.route('/authorize').get(this._controller.authorize);

        return this._router;
    }
}
