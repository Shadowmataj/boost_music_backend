import fs from "fs"
import config from "../config.js"
import moment from "moment"

if (!fs.existsSync(config.THIS_PATH_CARTS)) {
    fs.writeFileSync(config.THIS_PATH_CARTS, JSON.stringify([]))
}

export class CartsManagers {
    constructor() {
        this.idLength = 8
        this.cartList = JSON.parse(fs.readFileSync(config.THIS_PATH_CARTS))
    }

    idGenerator() {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length
        let result = ""
        for (let i = 0; i < this.idLength; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result
    }

    addCartService(product) {
        let id = ''
        const idCartList = this.cartList.map(item => item.id)
        const date = moment().format()
        do {
            id = this.idGenerator()
        } while (idCartList.some(item => item.id === id))

        const item = {
            id,
            products: product,
            date: date
        }

        this.cartList.push(item)
        fs.writeFileSync(config.THIS_PATH_CARTS, JSON.stringify(this.cartList))
        return item
    }

    getCartByIdService(id) {
        const cart = this.cartList.find(item => item.id === id)
        return cart
    }

    updateCartService(cid, pid, quantity) {
        const cartIndex = this.cartList.findIndex(item => item.id === cid)
        const productsList = JSON.parse(fs.readFileSync(config.THIS_PATH_PRODUCTS))
        const productExists = productsList.some(item => item.id === pid)
        if (cartIndex != -1 && productExists) {
            const productIndex = this.cartList[cartIndex].products.findIndex(item => item.id === pid)
            if (productIndex != -1) {
                const cart = this.cartList[cartIndex].products[productIndex]
                cart.quantity = cart.quantity + quantity
            } else {
                const item = {
                    id: pid,
                    quantity: quantity
                }
                this.cartList[cartIndex].products.push(item)
            }
            this.cartList[cartIndex].date = this.cartList[cartIndex].date = moment().format()
            fs.writeFileSync(config.THIS_PATH_CARTS, JSON.stringify(this.cartList))
        }
        return cartIndex != -1 && productExists
    }

}