import { Router } from "express";
import productsModel from "../dao/models/products.models.js";
import messagesModel from "../dao/models/messages.models.js";
import cartsModel from "../dao/models/cart.models.js";


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

routes.get("/products", async (req, res) => {
    // const data = await JSON.parse(fs.readFileSync(config.THIS_PATH_PRODUCTS))
    const page = +(req.query.page||1)
    const data = await productsModel.paginate({}, {page:page,limit:10, lean: true})
    const resp = {
        styles: "index.css",
        products: data
    }
    res.render("products", resp)
})

routes.get("/products/:pid", async (req, res) => {
    // const data = await JSON.parse(fs.readFileSync(config.THIS_PATH_PRODUCTS))
    const pid = req.params.pid
    const data = await productsModel.findById(pid).lean()
    const resp = {
        styles: "index.css",
        product: data
    }
    res.render("productsDetails", resp)
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

routes.get("/carts/:cid", async (req, res) => {
    const cartId = req.params.cid
    const data = await cartsModel.findById(cartId).populate({path: "products.id", model: productsModel}).lean()
    const resp = {
        styles: "index.css",
        cart: data
    }
    res.render("carts", resp)
})


export default routes