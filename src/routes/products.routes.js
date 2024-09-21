// *****PRODUCTS ROUTES FILE ******

import { Router } from "express";
import moment from "moment";
// import { ProductManagers } from "../dao/MangersFileSystem/ProductManagers.js"
import { ProductManagers } from "../controller/products.manager.js"
import { filterAuth, verifyToken } from "../services/utils.js";
import { generateFakeProducts } from "../faker/faker.js";


const productsRouter = Router()
const pm =  new ProductManagers()

// endpoint to get an entire porducts list or a limited one
productsRouter.get("/", async (req, res) => {
    const limit = +(req.query.limit || 9)
    const page = +(req.query.page || 1)
    const sort = +(req.query.sort || 0)
    const property = req.query.property|| ""
    const filter = req.query.filter || ""
    const query = {}
    if (property && filter) query[property] = filter

    console.log(filter)
    try {
        const resp = await pm.getProducts(limit, page, sort, query, property, filter)
        if (resp.status === "OK") {
            req.logger.info(`${new moment().format()} ${req.method} api/products${req.url}`)
            res.status(200).send(resp)
        } else if (resp.status === "ERROR") {
            req.logger.error(`${new moment().format()} ${req.method} api/products${req.url} ${resp.type.message}`)
            res.status(400).send({ status: "ERROR", error: `${resp.type.message}` })
        }
    } catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} api/products${req. url} ${err}`)
    }
    // res.status(200).send({ status: "OK", payload: productsList })
})

// endpoint to get a specific product filtered by the id
productsRouter.get("/:pid", async (req, res) => {
    const productId = req.params.pid
    try {
        const product = await pm.getProductbyId(productId)
        if (product.status === "OK") {
            req.logger.info(`${new moment().format()} ${req.method} api/products${req.url}`)
            res.status(200).send({ status: "OK", payload: product.payload })
        }
        else if (product.status === "ERROR") {
            req.logger.error(`${new moment().format()} ${req.method} api/products${req.url} ${product.type.name}`)
            res.status(400).send({ status: product.status, Error: `${product.type.name}: No existe un producto con el ID: ${productId}` })
        }
    } catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} api/products${req.url} ${err}`)
    }
    // FileSystem
    // product ?
    //     res.status(200).send({ status: "OK", payload: product }) :
    //     res.status(400).send({ ERROR: `ID Not found: ${productId}` })
})

//endpoint to get a list of 100 products using Mocking
productsRouter.get("/faker/:qty", async (req, res) => {
    const quantity = req.params.qty || 100
    try {
        const products = generateFakeProducts(quantity)
        req.logger.info(`${new moment().format()} ${req.method} api/products${req.url}`)
        res.status(200).send({ status: "OK", payload: products })
    } catch (err) {
        req.logger.info(`${new moment().format()} ${req.method} api/products${req.url} ${err}`)
        res.status(400).send({ Error: `No se pudo procesar la solicitud. ${err}` })
    }
})

//endpoint to add new products. 
productsRouter.post("/", verifyToken, filterAuth(["admin", "premium"]), async (req, res) => {
    const socketServer = req.app.get("socketServer")
    const { title, description, price, thumbnails, code, stock, status, category, owner } = req.body
    try {
        const item = await pm.productDTO(title, description, thumbnails, price, category, stock, code, status, owner)
        if (req.user.role === "premium") item.owner = req.user.email
        const resp = await pm.addProduct(item)

        if (resp.status === "OK") {
            const productsList = await pm.getProducts(0)
            socketServer.emit("update_for_all", productsList)
            req.logger.info(`${new moment().format()} ${req.method} api/products${req.url}`)
            res.status(200).send({ status: resp.payload })
        } else if (resp.status === "ERROR") {
            req.logger.error(`${new moment().format()} ${req.method} ${req.url} api/products${resp.type}`)
            res.status(400).send({ ERROR: `${resp.type}` })
        }
    } catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} api/products${req.url} ${err}`)
    }
    // FileSystem
    // if (resp) {
    //     res.status(200).send({ status: "El producto ha sido agregado exitosamente" })
    //     socketServer.emit("update_db_products", "Se agregó un elemento a la base de datos.")
    // } else {
    //     res.status(400).send({ ERROR: `El producto con ${code} ya existe.` })
    // }
})

// endpoint to update a specific product
productsRouter.put("/:pid", verifyToken, filterAuth(["admin", "premium"]), async (req, res) => {
    const id = req.params.pid
    const { title, description, price, thumbnails, code, stock, status, category } = req.body
    let resp = undefined
    try {
        const product = await pm.getProductbyId(id)
        if (req.user.role === "admin" || (req.user.role === "premium" && req.user.email === product.payload.owner)) resp = await pm.updateProduct(id, title, description, price, thumbnails, code, stock, status, category)
        else throw new Error("El producto no puede ser actualizado por el usuario ya que no le pertenece.")
        if (resp.status === "OK") {
            req.logger.info(`${new moment().format()} ${req.method} api/products${req.url}`)
            res.status(200).send({ status: `El producto con ID ${id} ha sido actualizado exitosamente` })
        } else if (resp.status === "ERROR") {
            req.logger.error(`${new moment().format()} ${req.method} api/products${req.url} ${resp.type.name}`)
            throw new Error(`No existe un producto con el ID: ${id}`)
        }
    } catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} api/products${req.url} ${err}`)
        res.status(400).send({ status: "ERROR", type: `${err}` })
    }
    // FileSystem
    // resp ?
    // res.status(200).send({ status: `El producto con ID ${productId} ha sido actualizado exitosamente` }) :
    // res.status(400).send({ ERROR: `El producto con ID ${productId} no existe.` })
})

// Endpoint to delete a specifc product using the id
productsRouter.delete("/:pid", verifyToken, filterAuth(["admin", "premium"]), async (req, res) => {
    const socketServer = req.app.get("socketServer")
    const id = req.params.pid
    let resp = undefined
    try {
        const product = await pm.getProductbyId(id)
        if (req.user.role === "admin" || (req.user.role === "premium" && req.user.email === product.payload.owner)) resp = await pm.deleteProduct(id)
        else throw new Error("El producto no puede ser eliminado por el usuario ya que no le pertenece.")
        if (resp.status === "OK") {
            const productsList = await pm.getProducts(0)
            socketServer.emit("update_for_all", productsList)
            res.status(200).send({ status: `El producto con ID ${id} ha sido eliminado exitosamente` })
            req.logger.info(`${new moment().format()} ${req.method} api/products${req.url}`)
        } else if (resp.status === "ERROR") {
            req.logger.error(`${new moment().format()} ${req.method} api/products${req.url}`)
            throw new Error(`El producto con ID ${id} no existe.`)
        }
    } catch (err) {
        req.logger.error(`${new moment().format()} ${req.method} api/products${req.url} ${err}`)
        res.status(400).send({ status: "ERROR", type: `${err}` })
    }
    // FileSystem
    // if (resp) {
    //     res.status(200).send({ status: `El producto con ID ${productId} ha sido eliminado exitosamente` })
    //     socketServer.emit("update_db_products", "Se eliminó un elemento de la base de datos.")

    // } else {
    //     res.status(400).send({ ERROR: `El producto con ID ${productId} no existe.` })
    // }
})

export default productsRouter