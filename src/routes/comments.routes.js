// *****PRODUCTS ROUTES FILE ******

import { Router } from "express";
import commentsModels from "../models/comments.models.js"

const commentsRouter = Router()

// endpoint to get an entire porducts list or a limited one
commentsRouter.get("/", async (req, res) => {
    const comments = await commentsModels.find()
    res.status(200).send({payload: comments}) 
})



export default commentsRouter