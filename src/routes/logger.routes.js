import { Router } from "express";
import moment from "moment";

const routes = Router()

// endpoint to get a handlebar for the products list.
routes.get("/", async (req, res) => {
    req.logger.debug(`${new moment().format()} ${req.method} logger${req.url} PRUEBA`)
    req.logger.http(`${new moment().format()} ${req.method} logger${req.url} PRUEBA`)
    req.logger.info(`${new moment().format()} ${req.method} logger${req.url} PRUEBA`)
    req.logger.warning(`${new moment().format()} ${req.method} logger${req.url} PRUEBA`)
    req.logger.error(`${new moment().format()} ${req.method} logger${req.url} PRUEBA`)
    req.logger.fatal(`${new moment().format()} ${req.method} logger${req.url} PRUEBA`)
})




export default routes