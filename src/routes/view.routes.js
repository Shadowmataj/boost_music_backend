import { Router } from "express";
import fs from "fs"
import config from "../config.js";


const routes = Router()

routes.get("/", async (req, res) => {
    const data = await JSON.parse(fs.readFileSync(config.THIS_PATH_PRODUCTS))
    const resp = {
        styles: "index.css",
        products: data
    }
    res.render("home", resp)
})

routes.get("/realtimeproducts/", async (req, res) => {
    const data = await JSON.parse(fs.readFileSync(config.THIS_PATH_PRODUCTS))
    const resp = {
        styles: "index.css",
        products: data
    }
    res.render("realTimeProducts", resp)
})


export default routes