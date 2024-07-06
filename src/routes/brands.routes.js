// *****CART ROUTES FILE ******

import { Router } from "express";
import brandsModels from "../models/brands.models.js";

const brandsRouter = Router()


// endpoint to get the information of a specific cart  
brandsRouter.get("/", async (req, res) => {
    const brands = await brandsModels.find()
    res.status(200).send({payload: brands})  
})

export default brandsRouter