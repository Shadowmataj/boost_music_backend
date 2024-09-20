import mongoose from "mongoose";

mongoose.pluralize(null)

const collection = "ticket"

const schema = new mongoose.Schema({
    products: {type:[{id: String , quantity: Number }], require: true, ref: "products"}, 
    date: {type:String, require: true},
    amount: {type:Number, require: true},
    purchaser: {type: String, require: true},
    adress: {type: Object, required: true, default: {}}
})

const model = mongoose.model(collection,schema)

export default model