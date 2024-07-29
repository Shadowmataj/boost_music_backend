import winston from "winston";

import config from "../config.js";
import moment from "moment";

const devLogger = winston.createLogger({

    transports: [
        new winston.transports.Console({level: "verbose"})
    ]
})

export const addLogger = (req, res, next) => {
    req.logger = devLogger
    req.logger.info(`${moment().format()} ${req.method} ${req.url}`)
    next()
}
