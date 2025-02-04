import nodemailer from "nodemailer"

import productsModel from "../models/products.models.js"
import config, { errorsDictionary } from "../config.js"
import CustomError from "./customError.class.js"

const transport = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
        user: config.GMAIL_MAIL,
        pass: config.GMAIL_APP_PASS
    }
})

// create a class ProductManager to manage all the products we need.
class ProductServices {
    // the constructor creates all the elements we need in our product manager     
    // async function to add products into de data base
    constructor() {

    }

    /**
     * Method to create a new product in the db.
     * @param {object} item An object with the new product information.
     * @returns The status and a description.
     */
    async addProductService(item) {

        try {
            await productsModel.create(item) //create the product on the db.
            return { status: "OK", payload: "El producto ha sido agregado exitosamente" } //return status.
        } catch (err) {
            return { status: "ERROR", type: err } //in case of error 
        }
    }

    /**
     * Method to get a certain amount of products or the entire array
     * @param {number} limitProducts The limit of products per page.
     * @param {number} pageNumber The number of page to search.
     * @param {number} sortProducts If the products should be sorted.
     * @param {string} queryProperty to select products avalables or not.
     * @param {string} property the property to look for.
     * @param {string} filter to set tro 
     * @returns The
     */
    async getProductsService(limitProducts, pageNumber, sortProducts, queryProperty, property, filter) {
        try {
            let link = `http://localhost:${config.PORT}/api/products?limit=${limitProducts}` //link to use with handlebars.
            const options = { page: pageNumber, limit: limitProducts } //paginate options.

            const categories = await productsModel.distinct("category") //get all the category products.

            if (property === "availability" && filter === "true") { 
                queryProperty = { stock: { $gt: 0 } } 
            } else if (property === "availability" && filter === "false") {
                queryProperty = { stock: { $eq: 0 } }
            }

            if (Math.abs(sortProducts) === 1) { //if sort products abs equals to 1.
                options["sort"] = { price: sortProducts } //add sort by price to options.
                link = `${link}&sort=${sortProducts}`//and modify link (for handlebars).
            }
            const products = await productsModel.paginate(
                queryProperty, options) //paginate products with the specified parameters.

            if (products.docs.length === 0) throw new CustomError(errorsDictionary.INVALID_PARAMETER) //if there's no products with the specified parameters throw a custom error.

            const result = { status: "OK", payload: products.docs, totalPages: products.totalPages, prevPage: products.prevPage, nextPage: products.nextPage, page: products.page, hasPrevPage: products.hasPrevPage, hasNextPage: products.hasNextPage, categories: categories } //make the response with the paginated respons. 

            //modify the link for handlebars.
            if (property) link = `${link}&property=${property}`
            if (filter) link = `${link}&filter=${filter}`

            if (products.hasPrevPage === false) result["prevLink"] = null
            else {
                result["prevLink"] = `${link}&page=${pageNumber - 1}`
            }
            if (products.hasNextPage === false) result["nextLink"] = null
            else {
                result["nextLink"] = `${link}&page=${pageNumber + 1}`
            }

            return result //return the final respons. 
        } catch (err) {
            return { status: "ERROR", type: err.type }
        }
    }

    /**
     * Method to get a specific product by id
     * @param {string} pid 
     * @returns the status and the product.
     */
    async getProductByIdService(pid) {

        try {
            const product = await productsModel.findById(pid) //get the product.
            return { status: "OK", payload: product } //return the status and the product.

        } catch (err) {
            return { status: "ERROR", type: err } //return the status and the error.
        }
    }

    /**
     * Method to erase a product in our database
     * @param {string} pid The mongo product id.
     * @returns The status and the deleted product.
     */
    async deleteProductService(pid) {

        try {
            const product = await productsModel.findByIdAndDelete(pid) //delete the producto in the db.
            if (product.owner !== "admin") { //if the product owner is admin, it sends a notification mail.
                let confirmation = await transport.sendMail({
                    from: config.GMAIL_MAIL,
                    to: product.owner,
                    subject: "Producto eliminado.",
                    html: `
                    <h1>Te enviamos este correo para informarte que el siguiente producto ha sido eliminado</h1>
                    <ul>
                        <li>Nombre del producto: ${product.title}</li>
                        <li>ID: ${product._id}</li>
                    </ul>
                    
                    `
                })
            }
            return { status: "OK", payload: product } //return the status and the product.
        } catch (err) {
            return { status: "ERROR", type: err } //return the error.
        }

    }

    /**
     * Method to update a specific product elements.
     * @param {string} pid The mongo product id.
     * @param {string} title The new title title.
     * @param {string} description The new description title.
     * @param {number} price The new price title.
     * @param {string} thumbnails The new thumbnails title.
     * @param {string} code The new code title.
     * @param {number} stock The new stock title.
     * @param {boolean} status The new status title.
     * @param {string} category The new category title.
     * @param {string} owner The new category title.
     * @returns The status and the products.
     */
    async updateProductService(pid, title, description, price, thumbnails, code, stock, status, category, owner) {

        try {
            const product = {}

            //building the new product object.
            if (!(product.title === title || title === "N/A")) product["title"] = title
            if (!(product.description === description || description === "N/A")) product["description"] = description
            if (!(product.price === price || price === "N/A")) product.price = price
            if (!(product.thumbnails === thumbnails || thumbnails === "N/A")) product["thumbnails"] = thumbnails
            if (!(product.code === code || code === "N/A")) product["code"] = code
            if (!(product.stock === stock || stock === "N/A")) product["stock"] = stock
            if (!(product.status === status || status === "N/A")) product["status"] = status
            if (!(product.category === category || category === "N/A")) product["category"] = category
            if (!(product.owner === owner || owner === "N/A")) product["owner"] = owner

            await productsModel.findByIdAndUpdate(pid, product) //update the product in db.
            return { status: "OK", payload: "Actualizado" } //return status and description.
        } catch (err) {
            return { status: "ERROR", type: err } //return error.
        }
    }

}


export default ProductServices