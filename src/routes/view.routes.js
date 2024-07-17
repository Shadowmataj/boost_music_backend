import { Router } from "express";
import cartsModel from "../models/cart.models.js";
import messagesModel from "../models/messages.models.js";
import productsModel from "../models/products.models.js";
import { filterAuth } from "../services/utils.js";

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
    if(req.session.user) resp["user"] = req.session.user
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
    if(req.session.user) resp["user"] = req.session.user
    res.render("realTimeProducts", resp)
})

routes.get("/chat", filterAuth("user"), async (req, res) => {
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

routes.get("/login", async (req, res) => {
    if(req.session.user){
        res.redirect("/views/profile")
    }
    res.render("login", {styles: "index.css", showError: req.query.error ? true: false, errorMessage: req.query.error })
})

routes.get("/register", async (req, res) => {
    
    const resp = {
        styles: "index.css",
        user: req.session.user
    }
    res.render("register", resp)
})

routes.get("/profile", async (req, res) => {
    if(!req.session.user){
        res.redirect("/views/login")
    } 
    const resp = {
        styles: "index.css",
        user: req.session.user
    }
    return res.render("profile", resp)
})


export default routes