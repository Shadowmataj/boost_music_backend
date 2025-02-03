// *****ARTISTS ROUTES FILE ******

import { Router } from "express";
import artistsModels from "../models/artists.models.js"
import moment from "moment";

const artistsRouter = Router()

// endpoint to get an entire artists list.
artistsRouter.get("/", async (req, res) => {
    try{
        // Looking for the artist in the db using the artists model.
        const artists = await artistsModels.find()
        // Response: status code and payload.
        res.status(200).send({ payload: artists })
        req.logger.info(`${moment().format()} ${req.method} api/artists${req.url}`)
    } catch (err){
        req.logger.error(`${moment().format()} ${req.method} api/artists${req.url} ${err}`)
    }
})

export default artistsRouter