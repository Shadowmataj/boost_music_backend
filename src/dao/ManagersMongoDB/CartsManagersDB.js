import fs from "fs"
import config from "../../config.js"
import moment from "moment"
import cartModels from "../models/cart.models.js"
import productsModel from "../models/products.models.js"

export class CartsManagers {

    async addCart(product) {
        const date = moment().format()
        const item = {
            products: product,
            date: date
        }

        try {
            const productExist = await productsModel.findOne({ _id: product[0].id })
            if (productExist == null) throw "El ID producto no existe."
            const cart = await cartModels.insertMany(item)
            return { status: "OK", type: cart }
        } catch (err) {
            return { status: "ERROR", type: err }
        }
    }

    async getCartById(id) {
        try {
            const cart = await cartModels.findById(id).populate({ path: 'products.id', model: productsModel }).lean()
            return { status: "OK", payload: cart }
        } catch (err) {
            return { status: "ERROR", type: err }
        }
    }

    async updateCart(cid, pid, quantity) {
        try {
            const cart = await cartModels.findById(cid)
            const cartUpdated = null
            const date = null
            await productsModel.findOne({ _id: pid })
            const cartProducts = [...cart.products]
            console.log(cartProducts)
            const productIndex = cartProducts.findIndex(item => item.id === pid)
            if (productIndex != -1) {
                cartProducts[productIndex].quantity = cartProducts[productIndex].quantity + quantity
                cartUpdated = await cartModels.findByIdAndUpdate(cid, { products: cartProducts, date: date })
                date = moment().format()
                return { status: "OK", payload: cartUpdated }
            } else {
                const item = {
                    id: pid,
                    quantity: quantity
                }
                cartProducts.push(item)
                console.log(cartProducts)
                cartUpdated = await cartModels.findByIdAndUpdate(cid, { products: cartProducts, date: date })
            }
            
            date = moment().format()
            return { status: "OK", payload: cartUpdated }
        } catch (err) {
            return { status: "ERROR", type: err }
        }
    }

    async addCartProducts(cid, body) {
        try {
            const cart = await cartModels.findById(cid)
            const cartProducts = [...cart.products]
            for (let item of body) {
                await productsModel.exists({ _id: item.id })
                const productIndex = cartProducts.findIndex(itm => itm.id === item.id)
                if (productIndex !== -1) {
                    cartProducts[productIndex].quantity = cartProducts[productIndex].quantity + item.quantity
                } else {
                    const newItem = {
                        id: item.id,
                        quantity: item.quantity
                    }
                    cartProducts.push(newItem)
                }
            }
            await cartModels.findByIdAndUpdate(cid, { products: cartProducts })
            return { status: "OK", payload: cartProducts }
        } catch (err) {
            return { status: "ERROR", type: err }
        }
    }

    async updateCartProduct(cid, pid, quantity) {
        try {
            const cart = await cartModels.findById(cid).exec()
            const product = await productsModel.findOne({ _id: pid }).exec()
            const cartProducts = [...cart.products]
            const productIndex = cartProducts.findIndex(item => item.id === pid)
            if (productIndex != -1) {
                cartProducts[productIndex].quantity = cartProducts[productIndex].quantity + quantity
            } else {
                throw "El producto no se encuentra en el carrito."
            }
            const date = moment().format()

            const cartUpdated = await cartModels.findByIdAndUpdate(cid, { products: cartProducts, date: date }).exec()

            return { status: "OK", payload: cartUpdated }

        } catch (err) {
            return { status: "ERROR", type: err }
        }
    }

    async deleteCartProduct(cid, pid) {
        try {
            const cart = await cartModels.findById(cid)
            await productsModel.findById(pid)
            const newProductsArray = [...cart.products]
            const productIndex = newProductsArray.findIndex(item => item.id === pid)
            if (productIndex !== -1) {
                newProductsArray.splice(productIndex, 1)
                await cartModels.findByIdAndUpdate(cid, { products: newProductsArray })
                return { status: "OK", payload: newProductsArray }
            } else {
                throw Error("El producto no se encuentra en el carrito.")
            }
        } catch (err) {
            return { status: "ERROR", type: err }
        }
    }

    async deleteProducts(cid) {
        try {
            await cartModels.findByIdAndUpdate(cid, { products: [] })
            return { status: "OK", payload: "Se han eliminado los productos del carrito." }
        } catch (err) {
            console.log(`${err}`)
            return { status: "ERROR", type: err }
        }
    }

}