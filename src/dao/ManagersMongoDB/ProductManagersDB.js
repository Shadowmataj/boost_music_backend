import productsModel from "../models/products.models.js"


// create a class ProductManager to manage all the products we need.
export class ProductManagers {
    // the constructor creates all the elements we need in our product manager     
    // async function to add products into de data base
    async addProduct(title, description, thumbnails, price, category, stock, code, status) {

        try{
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
            console.log(item)
            await productsModel.insertMany([item])
            return {status:"OK", payload: "El producto ha sido agregado exitosamente"}
        } catch (err){
            return {status:"ERROR", type: err}
        }

        
    }
    //function to get a certain amount of products or the entire array
    async getProducts(limit) {
        try {
            if (limit === 0) {
                const products = await productsModel.find({}).lean()
                return { status: "OK", payload: products }
            } else {
                const products = await productsModel.find({}).limit(limit).lean()
                return { status: "OK", payload: products }
            }
        } catch (err) {
            return { status: "ERROR", type: err }
        }
    }
    //funtion to get a specific product by id
    async getProductbyId(pid) {

        try {
            const product = await productsModel.findById(pid)
            return { status: "OK", payload: product }

        } catch (err) {
            return { status: "ERROR", type: err }
        }
    }
    //async function to erase a product in our database
    async deleteProduct(id) {

        try {
            const product = await productsModel.findByIdAndDelete(id)
            return { status: "OK", payload: product }
        } catch (err) {
            return { status: "ERROR", type: err }
        }

    }

    async updateProduct(id, title, description, price, thumbnails, code, stock, status, category) {

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
