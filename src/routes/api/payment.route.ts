import express from 'express';
import { injectable } from 'tsyringe';

import validate from '../../middlewares/validate';
import Authentication from '../../middlewares/authentication';
import PaymentController from '../../controllers/payment.controller';
import * as paymentValidation from '../../validations/payment.validation';

@injectable()
export default class PaymentRoute {
    private readonly _controller: PaymentController;
    private readonly _authentication: Authentication;
    private _router = express.Router();

    constructor(paymentController: PaymentController, authentication: Authentication) {
        this._controller = paymentController;
        this._authentication = authentication;
    }

    public get router() {
        this._router
            .route('/link')
            .post(this._authentication.verify(), validate(paymentValidation.createLink), this._controller.createLink);
        this._router
            .route('/check/:checkid')
            .get(validate(paymentValidation.checkPayment), this._controller.checkPayment);

        return this._router;
    }
}
