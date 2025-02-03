import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"

mongoose.pluralize(null)

// Mongo collection name.
const collection = "products"

// Create the carts schema.
const schema = new mongoose.Schema({
    title: {type:String, require: true},
    description: {type:String, require: true},
    thumbnails: {type:String, require: true},
    price: {type:Number, require: true},
    category: {type:String, require: true},
    stock: {type:Number, require: true},
    code: {type:String, require: true},
    status: {type:Boolean, require: true},
    owner: { type: String, default: "admin" }
})

// Set de paginate plugin.
schema.plugin(mongoosePaginate)

// Compile the carts model.
const model = mongoose.model(collection,schema)

export default model