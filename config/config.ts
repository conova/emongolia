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
};
