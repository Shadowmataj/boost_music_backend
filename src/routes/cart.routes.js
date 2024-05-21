// *****CART ROUTES FILE ******

import { Router } from "express";
// import { CartsManagers } from "../CartsManagers.js";
import { CartsManagers } from "../dao/ManagersMongoDB/CartsManagersDB.js";
const cartRouter = Router()
const cm = new CartsManagers()


// endpoint to get the information of a specific cart  
cartRouter.get("/:cid", async (req, res) => {
    const id = req.params.cid

    const resp = await cm.getCartById(id)
    resp.status === "OK" ?
        res.status(200).send({ status: "OK", payload: resp.payload }) :
        res.status(400).send({ status: `${resp.type.name}: No existe un carrito con el ID: ${id}` })
    // FileSystem
    // resp ?
    //     res.status(200).send({ status: "OK", payload: resp }) :
    //     res.status(400).send({ status: `El carrito no existe.` })
})

// endpoint to create a new cart
cartRouter.post("/", async (req, res) => {
    const body = req.body
    let resp = null
    if (Array.isArray(body)) {
        resp = await cm.addCart(body)
        resp.status === "OK" ?
        res.status(200).send({ status: "OK", idCart: resp._id, description: "Se ha creado exitósamente el carrito" }) :
        res.status(400).send({ status: "No se ha podido generar el carrito." })
    }
    // File System
    // if (Array.isArray(body)) {
    //     resp = await cm.addCart(body)
    //     res.status(200).send({ status: "OK", idCart: resp.id, description: "Se ha creado exitósamente el carrito" })
    // } else {
    //     res.status(400).send({ status: "No se ha podido generar el carrito." })
    // }
})

// endpoint to add products or modify a specific cart
cartRouter.post("/:cid/product/:pid", async (req, res) => {
    const { pid, cid } = req.params
    const { quantity } = req.body
    const resp = await cm.updateCart(cid, pid, quantity)
    resp.status === "OK" ?
        res.status(200).send({ status: `El carrito ${resp.payload._id} fue actualizado de forma exitosa` }) :
        res.status(400).send({ status: `${resp.type.name}: No se pudo realizar la operación ya que el carrito o el producto no existe.` })

    // File System***********************************
    // const resp = await cm.updateCart(cid, id, quantity)
    // resp ?
    //     res.status(200).send({ status: "El carrito fue actualizado de forma exitosa"}) :
    //     res.status(400).send({ status: `No se pudo agregar el producto ya que el carrito o el producto no existe.` })


})


export default cartRouter