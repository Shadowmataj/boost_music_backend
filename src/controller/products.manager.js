import ProductsServices from "../services/products.dao.mdb.js"
// import { ProductsServices } from "../services/dao.factory.js"


const ps = new ProductsServices()

// create a class ProductManager to manage all the products we need.
export class ProductManagers {

    async productDTO(title, description, thumbnails, price, category, stock, code, status) {
        const item = {
            title: title,
            description: description,
            thumbnails: thumbnails,
            price: price,
            category: category,
            stock: stock,
            code: code,
            status: status,
        }

        return item
    }
    // the constructor creates all the elements we need in our product manager     
    // async function to add products into de data base
    async addProduct(item) {
        try {
            const resp = await ps.addProductService(item)
            return resp
        } catch (err) {
            console.log(`Function addProduct: ${err}`)
        }
    }
    //function to get a certain amount of products or the entire array
    async getProducts(limitProducts, pageNumber, sortProducts, queryProperty, property, filter) {
        try {
            const resp = await ps.getProductsService(limitProducts, pageNumber, sortProducts, queryProperty, property, filter)
            return resp
        } catch (err) {
            console.log(`Function getProducts: ${err}`)
        }
    }
    //funtion to get a specific product by id
    async getProductbyId(pid) {
        try {
            const resp = await ps.getProductByIdService(pid)
            return resp
        } catch (err) {
            console.log(`Function getProductbyId: ${err}`)
        }
    }
    //async function to erase a product in our database
    async deleteProduct(id) {

        try {
            const resp = await ps.deleteProductService(id)
            return resp
        } catch (err) {
            console.log(`Function deleteProduct: ${err}`)
        }

    }

    async updateProduct(id, title, description, price, thumbnails, code, stock, status, category, owner) {

        try {
            const resp = await ps.updateProductService(id, title, description, price, thumbnails, code, stock, status, category, owner)
            return resp
        } catch (err) {
            console.log(`Function updateProduct: ${err}`)
        }
    }

}
