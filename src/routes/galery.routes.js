// *****PRODUCTS ROUTES FILE ******

import { Router } from "express";
import artistsModels from "../dao/models/artists.models.js"

const galeryRouter = Router()

// endpoint to get an entire porducts list or a limited one
galeryRouter.get("/", async (req, res) => {
    const artists = await artistsModels.find()
    res.status(200).send({payload: artists}) 
})



export default artistsRouter