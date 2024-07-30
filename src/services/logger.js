import winston from 'winston';

import config from '../config.js';

const customLevels = {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http:4,
    debug: 5
}

const devLogger = winston.createLogger({
    levels: customLevels,
    transports: [
        new winston.transports.Console({ level: 'debug' })
    ]
});

const prodLogger = winston.createLogger({
    levels: customLevels,
    transports: [
        new winston.transports.Console({ level: 'info' }),
        new winston.transports.File({ level: 'error', filename: `${config.DIRNAME}/winston/errors.log` })
    ]
});

const addLogger = (req, res, next) => {
    req.logger = config.MODE === 'dev' ? devLogger : prodLogger;
    // req.logger.info(`${new Date().toDateString()} ${req.method} ${req.url}`);
    next();
}

export default addLogger;
