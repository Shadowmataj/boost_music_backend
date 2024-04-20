import { data } from "./data.js"


// create a class ProductManager to manage all the products we need.
export class ProductManagers {
    // the constructor creates all the elements we need in our product manager 
    constructor() {
        this.products = data //read the file and asign the data to this.products
        this.id = Math.max(...this.products.map(item => item.id))//identifies the max id number in our data base and asign it to avoid duplication
    }

    // async function to add products into de data base
    addProduct(title, description, price, thumbnails, code, stock, status, category) {

        const codeVerification = this.products.some(item => item.code == code)

        if (!codeVerification) {
            const item = {
                id: ++this.id,
                title: title,
                description: description,
                price: price,
                thumbnails: thumbnails,
                code: code,
                stock: stock,
                status: status,
                category: category
            }
            this.products.push(item)
            return true
        } else {
            return false
        }
    }
    //function to get a certain amount of products or the entire array
    getProducts(limit) {
        const newList = [...this.products]
        return limit === 0 ? newList : newList.splice(0, limit)
    }
    //funtion to get a specific product by id
    getProductbyId(pid) {
        const newList = [...this.products]
        const item = newList.find(resp => resp.id == pid)
        return item
    }
    //async function to erase a product in our database
    async deleteProduct(id) {
        const product = this.products.some((item => item.id === id))
        if (product) {
            this.products = this.products.filter(resp => resp.id !== id)
            return true
        } else {
            return false
        }

    }

    async updateProduct(id, title, description, price, thumbnails, code, stock, status, category) {
        const newList = [...this.products]

        const idExists = newList.find(item => item.id == id)
        const idList = newList.map(item => item.id)
        const index = idList.indexOf(id)

        if (idExists) {
            const product = this.products.filter(resp => resp.id === id)[0]
            
            if (!(product.title === title || title === "N/A")) product.title = title
            if (!(product.description === description || description === "N/A")) product.description = description
            if (!(product.price === price || price === "N/A")) product.price = price
            if (!(product.thumbnails === thumbnails || thumbnails === "N/A")) product.thumbnails = thumbnails
            if (!(product.code === code || code === "N/A")) product.code = code
            if (!(product.stock === stock || stock === "N/A")) product.stock = stock
            if (!(product.status === status || status === "N/A")) product.status = status
            if (!(product.category === category || category === "N/A")) product.category = category

            this.products.splice(index, 1, product)
            return true
        } else {
            return false
        }
    }

}