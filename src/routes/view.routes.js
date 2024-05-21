import { Router } from "express";
import productsModel from "../dao/models/products.models.js";
import messagesModel from "../dao/models/messages.models.js";


const routes = Router()

// endpoint to get a handlebar for the products list.
routes.get("/", async (req, res) => {
    // const data = await JSON.parse(fs.readFileSync(config.THIS_PATH_PRODUCTS))
    const data = await productsModel.find({}).lean()
    const resp = {
        styles: "index.css",
        products: data
    }
    res.render("home", resp)
})

// endpoint to get a habdlerbar that shows the product list in real time. 
routes.get("/realtimeproducts", async (req, res) => {
    // const data = await JSON.parse(fs.readFileSync(config.THIS_PATH_PRODUCTS))
    const data = await productsModel.find({}).lean()
    const resp = {
        styles: "index.css",
        products: data
    }
    res.render("realTimeProducts", resp)
})

routes.get("/chat", async (req, res) => {
    // const data = await JSON.parse(fs.readFileSync(config.THIS_PATH_PRODUCTS))
    const data = await messagesModel.find().lean()
    const resp = {
        styles: "index.css",
        messages: data
    }
    res.render("chat", resp)
})


export default routes