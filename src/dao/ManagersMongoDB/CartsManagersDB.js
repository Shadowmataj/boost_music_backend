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
            const productExist = await productsModel.findOne({_id: product[0].id})
            if (productExist == null) throw "El ID producto no existe."
            const cart = await cartModels.insertMany(item)
            return {status:"OK", type: cart }
        } catch (err) {
            return {status:"ERROR", type: err }
        }
    }

    async getCartById(id) {
        try{
            const cart = await cartModels.findById(id)
            return {status:"OK", payload: cart }
        } catch (err){
            return {status:"ERROR", type: err }
        }
    }

    async updateCart(cid, pid, quantity) {
        try{
            const cart = await cartModels.findById(cid).exec()
            const product = await productsModel.findOne({_id: pid}).exec()
            const cartProducts = [...cart.products]
            const productIndex = cartProducts.findIndex(item => item.id === pid)
            if (productIndex != -1) {
                cartProducts[productIndex].quantity = cartProducts[productIndex].quantity + quantity
            } else {
                const item = {
                    id: pid,
                    quantity: quantity
                }
                cartProducts.push(item)
            }
            const date = moment().format()
            
            const cartUpdated = await cartModels.findByIdAndUpdate(cid, {products: cartProducts, date: date} ).exec()
            
            return {status:"OK", payload: cartUpdated }

        } catch (err) {
            return {status:"ERROR", type: err }
        }
    }

}