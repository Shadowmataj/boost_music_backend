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
     * Method to create a cart and return it.
     * @param {array} product array with the products custumer wants to buy.
     * @returns The cart saved in the db.
     */
    async addCartService(product) {

        const date = moment().format()                  //get the current day.
        const item = {
            products: product,
            date: date
        }                                               //create an object with the day and the specified products.
        try {
            const cart = await cartModels.create(item)  //create a new cart.
            return cart                                 //return the created cart.
        } catch (err) {
            console.log(err)                            //in case of error, it's show on the console.
        }
    }

    /**
     * Method to get an specific cart using the id.
     * @param {string} id The mongo id of the cart we want to get
     * @returns Status from the operations, if it can get the cart or not
     */
    async getCartByIdService(id) {
        try {
            const cart = await cartModels.findById(id).populate({ path: 'products.id', model: productsModel }).lean()              //getting the specified cart, and getting it as simple object.
            return { status: "OK", payload: cart }      //return the cart.
        } catch (err) {
            return { status: "ERROR", type: err.message } //in case of error, return the specific error.  
        }
    }

    /**
     * Method to add one product to a specific cart.
     * @param {string} cid The mongo cart id to update.
     * @param {string} pid The mongo product id to update.
     * @param {number} quantity The quantity of the product we want to add
     * @param {string} email The email from the person to verify if the product don't belong to that person
     * @returns Returns the cart updated if the operations is finished or the error during the operation
     */
    async updateCartService(cid, pid, quantity, email) {
        try {
            const cart = await cartModels.findById(cid) //search the car using the id.
            let cartUpdated = null
            const date = moment().format()  //get the current date.
            const product = await productsModel.findById(pid) //get the product to update the cart.

            if (email === product.owner) throw new Error("No puedes agregar tus propios artículos al carrito.") //in case of the buyer adds his own producto, it would return an error.

            const cartProducts = [...cart.products] //making a copy of the cartproducts to work with.
            const productIndex = cartProducts.findIndex(item => item.id === pid) //looking for the product in the actual cart's list.
            if (productIndex != -1) {  //if the product exists.
                cartProducts[productIndex].quantity = cartProducts[productIndex].quantity + quantity //adds the quantity to the existing product.
                cartUpdated = await cartModels.findByIdAndUpdate(cid, { products: cartProducts, date: date }) //update the cart with the new data.
            } else { //if the product doesn't exists.
                const item = {
                    id: pid,
                    quantity: quantity
                }   //create an item with the product id and the quantity.
                cartProducts.push(item) //push the new product into the cartProducts array.
                cartUpdated = await cartModels.findByIdAndUpdate(cid, { products: cartProducts, date: date }) //update the cart on the db.
            }
            return { status: "OK", payload: cartUpdated } //return the response and the cart updated.
        } catch (err) {
            return { status: "ERROR", type: err.message } //in case of any error, return the specific error message.
        }
    }

    /**
     * Method to update a specific cart with n products.
     * @param {string} cid The mongo cart id to update.
     * @param {array} body The array of new products to add to the cart.
     * @returns The status of the operation.
     */
    async addCartProductsService(cid, body) {
        try {
            const cart = await cartModels.findById(cid) //find the cart by the id.
            const cartProducts = [...cart.products] //create a copy array of the cart products.
            for (let item of body) { 
                const productExist = await productsModel.exists({ _id: item.id }) //check if the product actualy exists on the db to aboid any error.
                const productIndex = cartProducts.findIndex(itm => itm.id === item.id) //looking for the product on the cart.
                if (productIndex !== -1) { //if the product exists.
                    cartProducts[productIndex].quantity = cartProducts[productIndex].quantity + item.quantity //add the quantity to the existing product.
                } else { //if the product does not exist.
                    const newItem = {
                        id: item.id,
                        quantity: item.quantity
                    } //create an object with the product id and the quantity.
                    cartProducts.push(newItem) //push it into the cartProdcuts array.
                }
            } 
            await cartModels.findByIdAndUpdate(cid, { products: cartProducts }) //update the cart with the new products.
            return { status: "OK", payload: cartProducts } //return the response status and the updated cart products array.
        } catch (err) {
            return { status: "ERROR", type: err.message }
        }
    }

    /**
     * Method to update a specific cart with a specific product.
     * @param {string} cid The mongo cart id to update.
     * @param {string} pid The mongo product id to update.
     * @param {number} quantity The quantity of the product to add.
     * @returns The status of the operation.
     */
    async updateCartProductService(cid, pid, quantity) {
        try {
            const cart = await cartModels.findById(cid).lean() //look for the cart using the mongo id, and returnit as a simple object.
            await productsModel.exists({ _id: pid }) //check if the product to add actually exist on the database.
            const cartProducts = [...cart.products] //create a copy of the cart products array.
            const productIndex = cartProducts.findIndex(item => item.id === pid) //get the index of the new product. 
            if (productIndex != -1) { //if the product exists
                cartProducts[productIndex].quantity = cartProducts[productIndex].quantity + quantity //add the quantity to the existing product.
            } else { //if the product does not exists.
                throw new CustomError(errorsDictionary.CART_PRODUCT_ERROR) //throw a custom error.
            }
            const date = moment().format() //get the current date.

            const cartUpdated = await cartModels.findByIdAndUpdate(cid, { products: cartProducts, date: date }).exec() //update the cart with the new products. 

            return { status: "OK", payload: cartUpdated } //return the status and the updated array.

        } catch (err) {
            return { status: "ERROR", type: err.message } //in case of error, return the status and the specific message.
        }
    }

    /**
     * Method to complete a purchase
     * @param {string} cid The mongo cart id to update.
     * @param {string} email the buyer email.
     * @param {string} adress  the address to send the order.
     * @returns The status of the operation.
     */
    async purchasedCartService(cid, email, adress) {
        try {
            const cart = await cartModels.findById(cid) //get the the user's cart.
            const newCart = [] //constant to make the final ticket
            const incompletedPurchases = [] //constant to update the user's Cart with the products that were out of stock.
            const alerts = [] //constant to comunicate with the frontend, and letit know what products could not be purchased.
            const purchaseId = "" 
            let resp = { status: "OK" } //variable to construct the response. 


            for (const item of cart.products) { //for loop to every cart product.
                const productDetails = await productsModel.findById(item.id, "_id stock title price").lean() // getting the information from the product. 
                
                //Fix the stock availability and what products may be purchased.
                if (item.quantity > productDetails.stock || productDetails.stock === 0) {
                    incompletedPurchases.push({ id: item.id, quantity: item.quantity - productDetails.stock }) //register the products that could not be add to the purchase.
                    item.quantity = productDetails.stock //
                    if (item.quantity === 0) alerts.push({ id: productDetails._id, message: `Se ha eliminado el artículo ${productDetails.title} por falta de stock.` })
                    else alerts.push({ id: productDetails._id, message: `Se ha reducido la cantidad de ${productDetails.title} por falta de stock.` })
                }

                if (item.quantity > 0) newCart.push({ id: item.id, quantity: item.quantity, price: productDetails.price }) // If the product is not out of stock we add this products to the final purchase array.
            }
            
            const amount = newCart.reduce((acc, item) => acc += item.price * item.quantity, 0) //Calculating the total amount of the purchase.

            // Creating the final ticket.
            const ticket = {
                products: newCart,
                date: moment().format(),
                amount: amount,
                alerts: alerts,
                purchaser: email,
                adress: adress
            } //create the ticket object

            if (newCart.length > 0) { //if the cart is not empty
                const purchase = await ticketModel.create(ticket) //create the ticket on db.
                
                resp.purchaseInfo = purchase //add the purchase to the response.
                for (let item of newCart) { //for loop to update the stock on every article in the order.
                    const product = await productsModel.findById(item.id, "-_id stock").lean()
                    const updatedStock = product.stock - item.quantity
                    await productsModel.findByIdAndUpdate(item.id, { stock: updatedStock })
                }

                resp.payload = `Su compra ${purchase._id} se ha finalizado.` //add payload to the response.
            } else throw new Error("El carrito está vacío")
            // Updating the user's cart with the products that couldn't be purchased. 
            if (incompletedPurchases.length > 0) await cartModels.findByIdAndUpdate(cid, { products: incompletedPurchases }) //keep the articles with no stock on the cart.

            resp.alerts = alerts  //add the alerts to the response.
            return resp //return the response.
        } catch (err) {
            return { status: "ERROR", type: err} //in case of error, return the error.
        }
    }

    /**
     * Method to delete an specific product inside of an specific cart.
     * @param {string} cid The mongo cart id to update.
     * @param {string} pid The mongo product id to delete.
     * @returns The status and the updated products array. 
     */
    async deleteCartProductService(cid, pid) {
        try {
            const cart = await cartModels.findById(cid) //get the cart using the mongo id.
            await productsModel.findById(pid) //checking if the product exists.
            const newProductsArray = [...cart.products] //create a copy of the cart products array
            const productIndex = newProductsArray.findIndex(item => item.id === pid) //look for the product index in the array.
            if (productIndex !== -1) { //if the product exists.
                newProductsArray.splice(productIndex, 1) //eliminate the product in the newProductsArray
                await cartModels.findByIdAndUpdate(cid, { products: newProductsArray }) //update the products array in the db.
                return { status: "OK", payload: newProductsArray } //return the status an the updated products.
            } else {
                throw new Error("El producto no se encuentra en el carrito.") //throw an error if the product is not on the cart.
            }
        } catch (err) {
            return { status: "ERROR", type: err.message } //in case of error, it returns the error message.
        }
    }

    /**
     * Method to delete the entire products in a specific cart.
     * @param {string} cid The mongo cart id to update.
     * @returns The status. 
     */
    async deleteProductsService(cid) {
        try {
            await cartModels.findByIdAndUpdate(cid, { products: [] }) //clear the products in the specific cart.
            return { status: "OK", payload: "Se han eliminado los productos del carrito." } //return the status and a description.
        } catch (err) {
            return { status: "ERROR", type: err.message } //in case of error return the error message.
        }
    }

}

export default CartsServices