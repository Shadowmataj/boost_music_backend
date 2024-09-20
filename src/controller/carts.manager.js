import CartsServices from "../services/carts.dao.mdb.js"
// import { CartsServices } from "../services/dao.factory.js"

const cs = new CartsServices()

class CartsManagers {

    async addCart(product) {
        try {
            const resp = await cs.addCartService(product)
            return resp
        } catch (err) {
            console.log(`Function addCart: ${err}`)
        }
    }

    async getCartById(id) {
        try {
            const resp = await cs.getCartByIdService(id)
            return resp
        } catch (err) {
            console.log(`Function GetCartById: ${err}`)
        }
    }

    async updateCart(cid, pid, quantity, email) {
        try {
            const resp = await cs.updateCartService(cid, pid, quantity, email)
            return resp
        } catch (err) {
            console.log(`Function updateCart: ${err}`)
        }
    }

    async addCartProducts(cid, body) {
        try {
            const resp = await cs.addCartProductsService(cid, body)
            return resp
        } catch (err) {
            console.log(`Function addCartProducts: ${err}`)
        }
    }

    async updateCartProduct(cid, pid, quantity) {
        try {
            const resp = await cs.updateCartProductService(cid, pid, quantity)
            return resp
        } catch (err) {
            console.log(`Function updateCartProducts: ${err}`)
        }
    }
    
    //The controller function dedicated to complete a purchase 
    async purchasedCart(cid, email, adress) {
        try {
            const resp = await cs.purchasedCartService(cid, email, adress)
            return resp
        } catch (err) {
            console.log(`Function purchasedCart: ${err}`)
        }
    }

    async deleteCartProduct(cid, pid) {
        try {
            const resp = await cs.deleteCartProductService(cid, pid)
            return resp
        } catch (err) {
            console.log(`Function deleteCartProduct: ${err}`)
        }
    }

    async deleteProducts(cid) {
        try {
            const resp = await cs.deleteProductsService(cid)
            return resp
        } catch (err) {
            console.log(`Function deleteProducts: ${err}`)
        }
    }

}

export default CartsManagers