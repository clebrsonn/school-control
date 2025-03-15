import {Express} from 'express';
import {logger} from '../utils/Logger';

var morgan = require('morgan')

export const configureLogs = (app: Express) => {
    app.use(morgan('combined'));
    app.use((req, res, next) => {
        logger.debug({
            method: req.method,
            url: req.url,
            payload: req.body,
            headers: req.headers,
        });
        next();
    });
};