// *****ARTISTS ROUTES FILE ******

import { Router } from "express";
import artistsModels from "../models/artists.models.js"
import moment from "moment";

const artistsRouter = Router()

// endpoint to get an entire porducts list or a limited one
artistsRouter.get("/", async (req, res) => {
    try{
        const artists = await artistsModels.find()
        res.status(200).send({ payload: artists })
        req.logger.info(`${new moment().format()} ${req.method} api/artists${req.url}`)
    } catch (err){
        req.logger.error(`${new moment().format()} ${req.method} api/artists${req.url} ${err}`)
    }
})

export default artistsRouter