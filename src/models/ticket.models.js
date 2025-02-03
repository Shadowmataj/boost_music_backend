import mongoose from "mongoose";

mongoose.pluralize(null)

// Mongo collection name.
const collection = "ticket"

// Create the ticket schema.
const schema = new mongoose.Schema({
    products: {type:[{id:String , quantity: Number }], require: true, ref: "products"}, 
    date: {type:String, require: true},
    amount: {type:Number, require: true},
    purchaser: {type: String, require: true},
    adress: {type: Object, required: true, default: {}}
})
// Compile the carts model.
const model = mongoose.model(collection,schema)

export default model