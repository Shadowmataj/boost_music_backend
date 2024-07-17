import { CartsServices } from "../services/dao.factory.js"

const cs = new CartsServices()

export class CartsManagers {

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

    async updateCart(cid, pid, quantity) {
        try {
            const resp = await cs.updateCartService(cid, pid, quantity)
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

    async purchasedCart(cid, email) {
        try {
            const resp = await cs.purchasedCartService(cid, email)
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