import mongoose from "mongoose";

mongoose.pluralize(null)

const collection = "carts"

const schema = new mongoose.Schema({
    products: {type:Array, require: true},
    date: {type:String, require: true}
})

const model = mongoose.model(collection,schema)

export default model