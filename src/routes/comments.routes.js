// *****COMMENTS ROUTES FILE ******

import { Router } from "express";
import moment from "moment";

import commentsModels from "../models/comments.models.js"

const commentsRouter = Router()

// endpoint to get an entire porducts list or a limited one
commentsRouter.get("/", async (req, res) => {
    try {
        const comments = await commentsModels.find()
        res.status(200).send({ payload: comments })
        req.logger.info(`${new moment().format()} ${req.method} api/comments${req.url}`)
    } catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} api/comments${req.url} ${err}`)
    }
})



export default commentsRouter