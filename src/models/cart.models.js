import mongoose from "mongoose";

mongoose.pluralize(null)

// Mongo collection name.
const collection = "carts"

// Create the carts schema.
const schema = new mongoose.Schema({
    products: {type:[{id: String , quantity: Number }], require: true, ref: "products"}, 
    date: {type:String, require: true}
})

// Compile the carts model.
const model = mongoose.model(collection,schema)

export default model