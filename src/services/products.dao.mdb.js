import productsModel from "../models/products.models.js"
import config from "../config.js"

// create a class ProductManager to manage all the products we need.
class ProductServices {
    // the constructor creates all the elements we need in our product manager     
    // async function to add products into de data base
    constructor(){
        
    }
    async addProductService(title, description, thumbnails, price, category, stock, code, status) {

        try {
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
            await productsModel.create(item)
            return { status: "OK", payload: "El producto ha sido agregado exitosamente" }
        } catch (err) {
            return { status: "ERROR", type: err }
        }
    }
    //function to get a certain amount of products or the entire array
    async getProductsService(limitProducts, pageNumber, sortProducts, queryProperty, property, filter) {
        try {
            let link = `http://localhost:${config.PORT}/api/products?limit=${limitProducts}`
            const options = { page: pageNumber, limit: limitProducts }

            const categories = await productsModel.distinct("category")

            if(property === "availability" && filter === "true"){
                queryProperty = {stock: {$gt: 0}}
            } else if (property === "availability" && filter === "false"){
                queryProperty = {stock: {$eq: 0}}                
            }

            if (sortProducts === 1 || sortProducts === -1) {
                options["sort"] = { price: sortProducts }
                link = `${link}&sort=${sortProducts}`
            }
            const products = await productsModel.paginate(
                queryProperty, options)

            if (products.docs.length === 0) throw "No existen elementos con la propiedad o el filtro seleccionados."
            
            const result = { status: "OK", payload: products.docs, totalPages: products.totalPages, prevPage: products.prevPage, nextPage: products.nextPage, page: products.page, hasPrevPage: products.hasPrevPage, hasNextPage: products.hasNextPage, categories: categories}

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

            return result
        } catch (err) {
            console.log(err)
            return { status: "ERROR", type: err }
        }
    }
    
    //funtion to get a specific product by id
    async getProductbyIdService(pid) {

        try {
            const product = await productsModel.findById(pid)
            console.log(product)
            return { status: "OK", payload: product }

        } catch (err) {
            return { status: "ERROR", type: err }
        }
    }
    //async function to erase a product in our database
    async deleteProductService(id) {

        try {
            const product = await productsModel.findByIdAndDelete(id)
            return { status: "OK", payload: product }
        } catch (err) {
            return { status: "ERROR", type: err }
        }

    }

    async updateProductService(id, title, description, price, thumbnails, code, stock, status, category) {

        try {
            const product = {}

            if (!(product.title === title || title === "N/A")) product["title"] = title
            if (!(product.description === description || description === "N/A")) product["description"] = description
            if (!(product.price === price || price === "N/A")) product.price = price
            if (!(product.thumbnails === thumbnails || thumbnails === "N/A")) product["thumbnails"] = thumbnails
            if (!(product.code === code || code === "N/A")) product["code"] = code
            if (!(product.stock === stock || stock === "N/A")) product["stock"] = stock
            if (!(product.status === status || status === "N/A")) product["status"] = status
            if (!(product.category === category || category === "N/A")) product["category"] = category
            await productsModel.findByIdAndUpdate(id, product)
            return { status: "OK", payload: "Actualizado" }
        } catch (err) {
            return { status: "ERROR", type: err }
        }
    }

}


export default ProductServices