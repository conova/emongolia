import express from 'express';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import config from '../config/config';
var path = require('path');

const router = express.Router();

if (config.env === 'dev') {
    var swagger_path = path.resolve(__dirname, './swaggerDef.yml');

    const specs = YAML.load(swagger_path);

    router.use('/', swaggerUi.serve).get(
        '/',
        swaggerUi.setup(specs, {
            explorer: true,
        })
    );
}

export default router;
