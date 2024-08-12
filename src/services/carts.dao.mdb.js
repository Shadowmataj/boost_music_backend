import moment from "moment"
import cartModels from "../models/cart.models.js"
import productsModel from "../models/products.models.js"
import ticketModel from "../models/ticket.models.js"
import usersModel from "../models/users.model.js"
import CustomError from "./customError.class.js"
import { errorsDictionary } from "../config.js"

class CartsServices {

    async addCartService(product) {
        const date = moment().format()
        const item = {
            products: product,
            date: date
        }
        try {
            const cart = await cartModels.create(item)
            return cart
        } catch (err) {
            console.log(err)
        }
    }

    async getCartByIdService(id) {
        try {
            const cart = await cartModels.findById(id).populate({ path: 'products.id', model: productsModel }).lean()
            return { status: "OK", payload: cart }
        } catch (err) {
            return { status: "ERROR", type: err }
        }
    }

    async updateCartService(cid, pid, quantity, email) {
        try {
            const cart = await cartModels.findById(cid)
            let cartUpdated = null
            const date = moment().format()
            const product = await productsModel.findOne({ _id: pid })
            
            if (email === product.owner) throw new Error("No puedes agregar tus propios artículos al carrito.")
            
                const cartProducts = [...cart.products]
            const productIndex = cartProducts.findIndex(item => item.id === pid)
            if (productIndex != -1) {
                cartProducts[productIndex].quantity = cartProducts[productIndex].quantity + quantity
                cartUpdated = await cartModels.findByIdAndUpdate(cid, { products: cartProducts, date: date })
            } else {
                const item = {
                    id: pid,
                    quantity: quantity
                }
                cartProducts.push(item)
                cartUpdated = await cartModels.findByIdAndUpdate(cid, { products: cartProducts, date: date })
            }
            return { status: "OK", payload: cartUpdated }
        } catch (err) {
            return { status: "ERROR", type: err }
        }
    }

    async addCartProductsService(cid, body) {
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

    async updateCartProductService(cid, pid, quantity) {
        try {
            const cart = await cartModels.findById(cid).exec()
            const product = await productsModel.findOne({ _id: pid }).exec()
            const cartProducts = [...cart.products]
            const productIndex = cartProducts.findIndex(item => item.id === pid)
            if (productIndex != -1) {
                cartProducts[productIndex].quantity = cartProducts[productIndex].quantity + quantity
            } else {
                throw new CustomError(errorsDictionary.CART_PRODUCT_ERROR)
            }
            const date = moment().format()

            const cartUpdated = await cartModels.findByIdAndUpdate(cid, { products: cartProducts, date: date }).exec()

            return { status: "OK", payload: cartUpdated }

        } catch (err) {
            return { status: "ERROR", type: err.type }
        }
    }

    // The service used by the Cart Controller to complete a purchase
    async purchasedCartService(cid, email) {
        try {
            // identifying the user's cart.
            const cart = await cartModels.findById(cid)
            const newCart = [] //To make the final ticket
            const incompletedPurchases = [] //To update the user's Cart with the products that were out of stock.
            const alerts = [] //To comunicate with the frontend, and letit know what products could not be purchased.
            let resp = { status: "OK" }


            for (const item of cart.products) {
                // Geting the information from the product. 
                const productDetails = await productsModel.findById(item.id, "_id stock title price").lean()
                //Fix the stock availability and what products may be purchased.
                if (item.quantity > productDetails.stock || productDetails.stock === 0) {
                    incompletedPurchases.push({ id: item.id, quantity: item.quantity - productDetails.stock })
                    item.quantity = productDetails.stock
                    if (item.quantity === 0) alerts.push({ id: productDetails._id, message: `Se ha eliminado el artículo ${productDetails.title} por falta de stock.` })
                    else alerts.push({ id: productDetails._id, message: `Se ha reducido la cantidad de ${productDetails.title} por falta de stock.` })
                }

                // If the product is not out of stock we add this products to the final purchase array.
                if (item.quantity > 0) newCart.push({ id: item.id, quantity: item.quantity, price: productDetails.price })

            }
            //Calculating the total amount of the purchase.
            const amount = newCart.reduce((acc, item) => acc += item.price * item.quantity, 0)

            // Creating the final ticket.
            const ticket = {
                products: newCart,
                date: moment().format(),
                amount: amount,
                alerts: alerts,
                purchaser: email
            }

            //Checking the cart is not empty, creating the ticket and updating the stock on db with mongo.
            if (newCart.length > 0) {
                const purchase = await ticketModel.create(ticket)
                for (let item of newCart) {
                    const product = await productsModel.findById(item.id, "-_id stock").lean()
                    const updatedStock = product.stock - item.quantity
                    await productsModel.findByIdAndUpdate(item.id, { stock: updatedStock })
                }

                resp.payload = `Su compra ${purchase._id} se ha finalizado.`
            } else throw new CustomError(errorsDictionary.EMPTY_CART_ERROR)
            // Updating the user's cart with the products that couldn't be purchased. 
            await cartModels.findByIdAndUpdate(cid, { products: incompletedPurchases })

            // sending the response to the front.
            resp.alerts = alerts
            return resp
        } catch (err) {
            return { status: "ERROR", type: err.type }
        }
    }

    async deleteCartProductService(cid, pid) {
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
                throw new CustomError(errorsDictionary.CART_PRODUCT_ERROR)
            }
        } catch (err) {
            return { status: "ERROR", type: err.type }
        }
    }

    async deleteProductsService(cid) {
        try {
            await cartModels.findByIdAndUpdate(cid, { products: [] })
            return { status: "OK", payload: "Se han eliminado los productos del carrito." }
        } catch (err) {
            return { status: "ERROR", type: err }
        }
    }

}

export default CartsServices