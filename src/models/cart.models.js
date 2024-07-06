import mongoose from "mongoose";
import productsModel from "../models/products.models.js"

mongoose.pluralize(null)

const collection = "carts"

const schema = new mongoose.Schema({
    products: {type:[{id: String , quantity: Number }], require: true, ref: "products"}, 
    date: {type:String, require: true}
})


const model = mongoose.model(collection,schema)

export default model