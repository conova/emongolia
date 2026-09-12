import express from 'express';
import { injectable } from 'tsyringe';

import validate from '../../middlewares/validate';
import Authentication from '../../middlewares/authentication';
import GolomtController from '../../controllers/golomt.controller';
import * as golomtValidation from '../../validations/golomt.validation';

@injectable()
export default class GolomtRoute {
    private readonly _controller: GolomtController;
    private readonly _authentication: Authentication;
    private _router = express.Router();

    constructor(golomtController: GolomtController, authentication: Authentication) {
        this._controller = golomtController;
        this._authentication = authentication;
    }

    public get router() {
        this._router
            .route('/withdraw')
            .post(
                this._authentication.verifyIp(),
                this._authentication.verifyApiKey(),
                validate(golomtValidation.withdraw),
                this._controller.withdraw
            );
        this._router
            .route('/statement')
            .post(
                this._authentication.verifyIp(),
                this._authentication.verifyApiKey(),
                validate(golomtValidation.statement),
                this._controller.statement
            );
        this._router
            .route('/account')
            .post(
                this._authentication.verifyIp(),
                this._authentication.verifyApiKey(),
                validate(golomtValidation.account),
                this._controller.saveAccount
            );
        this._router
            .route('/accounts')
            .get(this._authentication.verifyIp(), this._authentication.verifyApiKey(), this._controller.accounts);
        this._router
            .route('/rate')
            .get(
                this._authentication.verifyIp(),
                this._authentication.verifyApiKey(),
                validate(golomtValidation.rate),
                this._controller.rate
            );
        this._router
            .route('/balance')
            .post(
                this._authentication.verifyIp(),
                this._authentication.verifyApiKey(),
                validate(golomtValidation.balance),
                this._controller.balance
            );
        this._router
            .route('/account/details')
            .post(
                this._authentication.verifyIp(),
                this._authentication.verifyApiKey(),
                validate(golomtValidation.accountDetails),
                this._controller.accountDetails
            );
        this._router
            .route('/account/list')
            .post(
                this._authentication.verifyIp(),
                this._authentication.verifyApiKey(),
                validate(golomtValidation.accountList),
                this._controller.accountList
            );
        this._router
            .route('/account/type')
            .post(
                this._authentication.verifyIp(),
                this._authentication.verifyApiKey(),
                validate(golomtValidation.accountType),
                this._controller.accountType
            );
        this._router
            .route('/account/check')
            .post(
                this._authentication.verifyIp(),
                this._authentication.verifyApiKey(),
                validate(golomtValidation.accountCheck),
                this._controller.accountCheck
            );

        return this._router;
    }
}
