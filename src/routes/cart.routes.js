// *****CART ROUTES FILE ******

import { Router } from "express";
import { CartsManagers } from "../CartsManagers.js";

const cartRouter = Router()
const cm = new CartsManagers()

cartRouter.get("/:cid", async (req, res) => {
    const id = req.params.cid
    const resp = await cm.getCartById(id)
    resp ?
        res.status(200).send({ status: "OK", payload: resp }) :
        res.status(400).send({ status: `El carrito no existe.` })
})

cartRouter.post("/", async (req, res) => {
    const body = req.body
    let resp = null
    if (Array.isArray(body)) {
        resp = await cm.addCart(body)
        res.status(200).send({ status: "OK", idCart: resp.id, description: "Se ha creado exitósamente el carrito" })
    } else {
        res.status(400).send({ status: "No se ha podido generar el carrito." })
    }
})

cartRouter.post("/:cid/product/:pid", async (req, res) => {
    const { pid, cid  } = req.params
    const id = +pid
    const { quantity } = req.body
    const resp = await cm.updateCart(cid, id, quantity)
    resp ?
        res.status(200).send({ status: "OK", cartId: resp.id, products: resp.products }) :
        res.status(400).send({ status: `No se pudo agregar el producto ya que el carrito o el producto no existe.` })
})

cartRouter.delete("/")

export default cartRouter