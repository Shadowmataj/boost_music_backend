// *****BRANDS ROUTES FILE ******

import { Router } from "express";
import moment from "moment";

import brandsModels from "../models/brands.models.js";

const brandsRouter = Router()


// endpoint to get the information of a specific cart  
brandsRouter.get("/", async (req, res) => {
    try {
        const brands = await brandsModels.find()
        res.status(200).send({ payload: brands })
        req.logger.info(`${new moment().format()} ${req.method} api/brands${req.url}`)
    } catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} api/brands${req.url} ${err}`)
    }
})

export default brandsRouter