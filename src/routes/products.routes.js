// *****PRODUCTS ROUTES FILE ******

import { Router } from "express";
import { ProductManagers } from "../ProductManagers.js"


const productsRouter = Router()
const pm = new ProductManagers()

const updateDb = () => {

}


productsRouter.get("/", async (req, res) => {
    const limit = req.query.limit || 0
    const productsList = await pm.getProducts(limit)
    res.status(200).send({ status: "OK", payload: productsList })
})

productsRouter.get("/:pid", async (req, res) => {
    const productId = req.params.pid
    const product = await pm.getProductbyId(productId)
    product ?
        res.status(200).send({ status: "OK", payload: product }) :
        res.status(400).send({ ERROR: `ID Not found: ${productId}` })
})

productsRouter.post("/", async (req, res) => {
    const socketServer = req.app.get("socketServer")
    const { title, description, price, thumbnails, code, stock, status, category } = req.body
    const resp = await pm.addProduct(title, description, price, thumbnails, code, stock, status, category)
    if (resp) {
        res.status(200).send({ status: "El producto ha sido agregado exitosamente" })
        socketServer.emit("update_db_products", "Se agregó un elemento a la base de datos.")
    } else {
        res.status(400).send({ ERROR: `El producto con ${code} ya existe.` })
    }
})

productsRouter.put("/:pid", async (req, res) => {
    const id = req.params.pid || 0
    const productId = +id
    const { title, description, price, thumbnails, code, stock, status, category } = req.body
    const resp = await pm.updateProduct(productId, title, description, price, thumbnails, code, stock, status, category)
    resp ?
        res.status(200).send({ status: `El producto con ID ${productId} ha sido actualizado exitosamente` }) :
        res.status(400).send({ ERROR: `El producto con ID ${productId} no existe.` })
})

productsRouter.delete("/:pid", async (req, res) => {
    const socketServer = req.app.get("socketServer")
    const id = req.params.pid || 0
    const productId = +id
    const resp = await pm.deleteProduct(productId)
    if (resp) {
        res.status(200).send({ status: `El producto con ID ${productId} ha sido eliminado exitosamente` })
        socketServer.emit("update_db_products", "Se eliminó un elemento de la base de datos.")

    } else {
        res.status(400).send({ ERROR: `El producto con ID ${productId} no existe.` })
    }
})

export default productsRouter