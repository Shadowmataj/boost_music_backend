// *****PRODUCTS ROUTES FILE ******

import { Router } from "express";
// import { ProductManagers } from "../dao/MangersFileSystem/ProductManagers.js"
import { ProductManagers } from "../dao/ManagersMongoDB/ProductManagersDB.js"


const productsRouter = Router()
const pm = new ProductManagers()

// endpoint to get an entire porducts list or a limited one
productsRouter.get("/", async (req, res) => {
    const limit = +(req.query.limit || 10)
    const page = +(req.query.page || 1)
    const sort = +(req.query.sort || 0)
    const property  = req.query.property
    const filter = req.query.filter
    const query = {}
    if(property && filter) query[property] = filter
    const resp = await pm.getProducts(limit, page, sort, query, property, filter)
    if (resp.status === "OK") res.status(200).send(resp)
    else if (resp.status === "ERROR") res.status(400).send({ error: `${resp.type}`})
    // res.status(200).send({ status: "OK", payload: productsList })
})

// endpoint to get a specific product filtered by the id
productsRouter.get("/:pid", async (req, res) => {
    const productId = req.params.pid
    const product = await pm.getProductbyId(productId)
    if (product.status === "OK") res.status(200).send({ status: "OK", payload: product.payload })
    else if (product.status === "ERROR") res.status(400).send({ Error: `${product.type.name}: No existe un producto con el ID: ${productId}` })
    // FileSystem
    // product ?
    //     res.status(200).send({ status: "OK", payload: product }) :
    //     res.status(400).send({ ERROR: `ID Not found: ${productId}` })
})


//endpoint to add new products. 
productsRouter.post("/", async (req, res) => {
    const socketServer = req.app.get("socketServer")
    const { title, description, price, thumbnails, code, stock, status, category } = req.body
    const resp = await pm.addProduct(title, description, thumbnails, price, category, stock, code, status)
    if (resp.status === "OK") {
        res.status(200).send({ status: resp.payload })
        const productsList = await pm.getProducts(0)
        socketServer.emit("update_for_all", productsList)
    } else {
        res.status(400).send({ ERROR: `${resp.type}` })
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
productsRouter.put("/:pid", async (req, res) => {
    const id = req.params.pid
    const { title, description, price, thumbnails, code, stock, status, category } = req.body
    const resp = await pm.updateProduct(id, title, description, price, thumbnails, code, stock, status, category)
    if (resp.status === "OK") res.status(200).send({ status: `El producto con ID ${id} ha sido actualizado exitosamente` })
    else if (resp.status === "ERROR") res.status(400).send({ Error: `${resp.type.name}: No existe un producto con el ID: ${id}` })
    // FileSystem
    // resp ?
    // res.status(200).send({ status: `El producto con ID ${productId} ha sido actualizado exitosamente` }) :
    // res.status(400).send({ ERROR: `El producto con ID ${productId} no existe.` })
})

// Endpoint to delete a specifc product using the id
productsRouter.delete("/:pid", async (req, res) => {
    const socketServer = req.app.get("socketServer")
    const id = req.params.pid
    const resp = await pm.deleteProduct(id)
    if (resp.status === "OK") {
        res.status(200).send({ status: `El producto con ID ${id} ha sido eliminado exitosamente` })
        const productsList = await pm.getProducts(0)
        socketServer.emit("update_for_all", productsList)
    } else {
        res.status(400).send({ ERROR: `El producto con ID ${id} no existe.` })
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