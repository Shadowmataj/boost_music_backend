import { CartsServices } from "../services/carts.dao.mdb.js"

const cs = new CartsServices()

export class CartsManagers {

    async addCartService(product) {
        try {
            const resp = await cs.addCartService(product)
            return resp
        } catch (err) {
            console.log(`Function addCart: ${err}`)
        }
    }

    async getCartByIdService(id) {
        try {
            const resp = await cs.getCartById(id)
            return resp
        } catch (err) {
            console.log(`Function GetCartById: ${err}`)
        }
    }

    async updateCartService(cid, pid, quantity) {
        try {
            const resp = await cs.updateCart(cid, pid, quantity)
            return resp
        } catch (err) {
            console.log(`Function updateCart: ${err}`)
        }
    }

    async addCartProductsService(cid, body) {
        try {
            const resp = await cs.addCartProducts(cid, body)
            return resp
        } catch (err) {
            console.log(`Function addCartProducts: ${err}`)
        }
    }

    async updateCartProductService(cid, pid, quantity) {
        try {
            const resp = await cs.updateCartProduct(cid, pid, quantity)
            return resp
        } catch (err) {
            console.log(`Function updateCartProducts: ${err}`)
        }
    }

    async deleteCartProductService(cid, pid) {
        try {
            const resp = await cs.deleteCartProduct(cid, pid)
            return resp
        } catch (err) {
            console.log(`Function deleteCartProduct: ${err}`)
        }
    }

    async deleteProductsService(cid) {
        try {
            const resp = await cs.deleteProducts(cid)
            return resp
        } catch (err) {
            console.log(`Function deleteProducts: ${err}`)
        }
    }

}