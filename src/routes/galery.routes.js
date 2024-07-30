// *****GALERY ROUTES FILE ******

import { Router } from "express";
import moment from "moment";

import artistsModels from "../models/artists.models.js"

const galeryRouter = Router()

// endpoint to get an entire porducts list or a limited one
galeryRouter.get("/", async (req, res) => {
    try {
        const artists = await artistsModels.find()
        res.status(200).send({ payload: artists })
        req.logger.info(`${new moment().format()} ${req.method} api/galery${req.url}`)
    } catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} api/galery${req.url} ${err}`)
    }
})



export default artistsRouter