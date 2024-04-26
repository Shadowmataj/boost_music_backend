import { Router } from "express";
import fs from "fs"
import config from "../config.js";


const routes = Router()

// endpoint to get a handlebar for the products list.
routes.get("/", async (req, res) => {
    const data = await JSON.parse(fs.readFileSync(config.THIS_PATH_PRODUCTS))
    const resp = {
        styles: "index.css",
        products: data
    }
    res.render("home", resp)
})

// endpoint to get a habdlerbar that shows the product list in real time. 
routes.get("/realtimeproducts/", async (req, res) => {
    const data = await JSON.parse(fs.readFileSync(config.THIS_PATH_PRODUCTS))
    const resp = {
        styles: "index.css",
        products: data
    }
    res.render("realTimeProducts", resp)
})


export default routes