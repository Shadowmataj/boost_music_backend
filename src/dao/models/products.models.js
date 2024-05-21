import mongoose from "mongoose";

mongoose.pluralize(null)

const collection = "products"

const schema = new mongoose.Schema({
    title: {type:String, require: true},
    description: {type:String, require: true},
    thumbnails: {type:String, require: true},
    price: {type:Number, require: true},
    category: {type:String, require: true},
    stock: {type:Number, require: true},
    code: {type:String, require: true},
    status: {type:Boolean, require: true}
    
})

const model = mongoose.model(collection,schema)

export default model