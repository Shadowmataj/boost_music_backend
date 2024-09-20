import moment from "moment"
import { errorsDictionary } from "../config.js"
import cartModels from "../models/cart.models.js"
import productsModel from "../models/products.models.js"
import ticketModel from "../models/ticket.models.js"
import CustomError from "./customError.class.js"

class CartsServices {
    constructor() {

    }
    /**
     * 
     * @param {array} product array with the products custumer wants to buy
     * @returns The cart saved in the db
     */
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

    /**
     * 
     * @param {string} id The mongo id of the cart we want to get
     * @returns Status from the operations, if it can get the cart or not
     */
    async getCartByIdService(id) {
        try {
            const cart = await cartModels.findById(id).populate({ path: 'products.id', model: productsModel }).lean()
            return { status: "OK", payload: cart }
        } catch (err) {
            return { status: "ERROR", type: err.message }
        }
    }

    /**
     * Function to add one product to a specific cart.
     * @param {string} cid The mongo id of the cart we want to update 
     * @param {string} pid The mongo id of the product we want to add
     * @param {number} quantity The quantity of the product we want to add
     * @param {string} email The email from the person to verify if the product don't belong to that person
     * @returns Returns the cart updated if the operations is finished or the error during the operation
     */
    async updateCartService(cid, pid, quantity, email) {
        try {
            const cart = await cartModels.findById(cid)
            let cartUpdated = null
            const date = moment().format()
            const product = await productsModel.findById(pid)

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
            return { status: "ERROR", type: err.message }
        }
    }

    /**
     * Function to update a specific cart with n products
     * @param {string} cid The mongo id of the cart you want to update 
     * @param {array} body The array of new products to add to the cart
     * @returns The status of the operation
     */
    async addCartProductsService(cid, body) {
        try {
            const cart = await cartModels.findById(cid)
            const cartProducts = [...cart.products]
            for (let item of body) {
                const productExist = await productsModel.exists({ _id: item.id })
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
            return { status: "ERROR", type: err.message }
        }
    }

    async updateCartProductService(cid, pid, quantity) {
        try {
            const cart = await cartModels.findById(cid).lean()
            await productsModel.exists({ _id: pid }).lean()
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
            return { status: "ERROR", type: err.message }
        }
    }

    // The service used by the Cart Controller to complete a purchase
    async purchasedCartService(cid, email, adress) {
        try {
            // identifying the user's cart.
            const cart = await cartModels.findById(cid)
            const newCart = [] //To make the final ticket
            const incompletedPurchases = [] //To update the user's Cart with the products that were out of stock.
            const alerts = [] //To comunicate with the frontend, and letit know what products could not be purchased.
            const purchaseId = ""
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
                purchaser: email,
                adress: adress
            }

            //Checking the cart is not empty, creating the ticket and updating the stock on db with mongo.
            if (newCart.length > 0) {
                const purchase = await ticketModel.create(ticket)
                
                resp.purchaseInfo = purchase
                for (let item of newCart) {
                    const product = await productsModel.findById(item.id, "-_id stock").lean()
                    const updatedStock = product.stock - item.quantity
                    await productsModel.findByIdAndUpdate(item.id, { stock: updatedStock })
                }

                resp.payload = `Su compra ${purchase._id} se ha finalizado.`
            } else throw new Error("El carrito está vacío")
            // Updating the user's cart with the products that couldn't be purchased. 
            if (incompletedPurchases.length > 0) await cartModels.findByIdAndUpdate(cid, { products: incompletedPurchases })

            // sending the response to the front.
            resp.alerts = alerts
            return resp
        } catch (err) {
            return { status: "ERROR", type: err}
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
                throw new Error("El producto no se encuentra en el carrito.")
            }
        } catch (err) {
            return { status: "ERROR", type: err.message }
        }
    }

    async deleteProductsService(cid) {
        try {
            await cartModels.findByIdAndUpdate(cid, { products: [] })
            return { status: "OK", payload: "Se han eliminado los productos del carrito." }
        } catch (err) {
            return { status: "ERROR", type: err.message }
        }
    }

}

export default CartsServices