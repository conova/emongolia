import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';

if (process.env.NODE_ENV !== 'test') {
    dotenv.config({ path: path.join(__dirname, '../.env') });
} else {
    dotenv.config({ path: path.join(__dirname, '../.env.test') });
}

const envVarsSchema = Joi.object()
    .keys({
        NODE_ENV: Joi.string().valid('prod', 'dev', 'test', 'sandbox').required(),
        PORT: Joi.number().default(3000),

        EMONGOLIA_CLIENT_ID: Joi.string().required(),
        EMONGOLIA_CLIENT_SECRET: Joi.string().required(),
        EMONGOLIA_URI: Joi.string().required(),
        EMONGOLIA_REDIRECT_URI: Joi.string().required(),

        REDIRECT_URI: Joi.string().required(),

        HES_SALT: Joi.string().required(),
        HES_CLIENT_ID: Joi.string().required(),
        HES_PUBLIC_KEY_PATH: Joi.string().required(),
        HES_API_KEY: Joi.string().required(),

        APM_SECRET_TOKEN: Joi.string().required(),
        ELASTIC_URL: Joi.string().required(),

        NEGDI_URI: Joi.string().default('http://103.229.177.10:8032'),
        NEGDI_TERMINAL_ID: Joi.string().default('222'),
        NEGDI_USERNAME: Joi.string().default('TESTTERMINAL10'),
        NEGDI_PASSWORD: Joi.string().default('TESTTERMINAL10'),
        NEGDI_RETURN_URL: Joi.string().default('http://localhost:8001'),

        HES_PAYMENT_URI: Joi.string().default('https://bds.techfi.mn/bdc/api/kyc/payment_status'),
        HES_TRANSACTION_URI: Joi.string().allow('').default(''),

        X_API_KEY: Joi.string().allow('').default(''),
        ALLOWED_IPS: Joi.string().allow('').default(''),

        GOLOMT_URL: Joi.string().allow('').default(''),
        GOLOMT_NAME: Joi.string().default('gmtbankapi'),
        GOLOMT_PASSWORD: Joi.string().allow('').default(''),
        GOLOMT_SESSION_KEY: Joi.string().allow('').default(''),
        GOLOMT_IV_KEY: Joi.string().allow('').default(''),
        GOLOMT_KEY: Joi.string().allow('').default(''),
        GOLOMT_CLIENT_ID: Joi.string().allow('').default(''),
        GOLOMT_SCOPE: Joi.string().allow('').default(''),
        GOLOMT_REGISTER_NO: Joi.string().allow('').default(''),
        GOLOMT_ACCT_NO: Joi.string().allow('').default(''),
        GOLOMT_ACCT_NAME: Joi.string().allow('').default(''),
        GOLOMT_BANK_CODE: Joi.string().default('15'),
    })
    .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) throw new Error(`Config validation error: ${error.message}`);

export default {
    env: envVars.NODE_ENV,
    port: envVars.PORT,

    emongolia_client_id: envVars.EMONGOLIA_CLIENT_ID,
    emongolia_client_secret: envVars.EMONGOLIA_CLIENT_SECRET,
    emongolia_uri: envVars.EMONGOLIA_URI,
    emongolia_redirect_uri: envVars.EMONGOLIA_REDIRECT_URI,

    redirect_uri: envVars.REDIRECT_URI,

    hes_salt: envVars.HES_SALT,
    hes_client_id: envVars.HES_CLIENT_ID,
    hes_public_key_path: envVars.HES_PUBLIC_KEY_PATH,
    hes_api_key: envVars.HES_API_KEY,

    apm_secret_token: envVars.APM_SECRET_TOKEN,
    elastic_url: envVars.ELASTIC_URL,

    negdi_uri: envVars.NEGDI_URI,
    negdi_terminal_id: envVars.NEGDI_TERMINAL_ID,
    negdi_username: envVars.NEGDI_USERNAME,
    negdi_password: envVars.NEGDI_PASSWORD,
    negdi_return_url: envVars.NEGDI_RETURN_URL,

    hes_payment_uri: envVars.HES_PAYMENT_URI,
    hes_transaction_uri: envVars.HES_TRANSACTION_URI,

    x_api_key: envVars.X_API_KEY,
    allowed_ips: (<string>envVars.ALLOWED_IPS)
        .split(',')
        .map((ip: string) => ip.trim())
        .filter((ip: string) => ip.length > 0),

    golomt_url: envVars.GOLOMT_URL,
    golomt_name: envVars.GOLOMT_NAME,
    golomt_password: envVars.GOLOMT_PASSWORD,
    golomt_session_key: envVars.GOLOMT_SESSION_KEY,
    golomt_iv_key: envVars.GOLOMT_IV_KEY,
    golomt_key: envVars.GOLOMT_KEY,
    golomt_client_id: envVars.GOLOMT_CLIENT_ID,
    golomt_scope: envVars.GOLOMT_SCOPE,
    golomt_register_no: envVars.GOLOMT_REGISTER_NO,
    golomt_acct_no: envVars.GOLOMT_ACCT_NO,
    golomt_acct_name: envVars.GOLOMT_ACCT_NAME,
    golomt_bank_code: envVars.GOLOMT_BANK_CODE,
};
