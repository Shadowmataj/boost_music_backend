import mongoose from "mongoose";

mongoose.pluralize(null)

// Mongo collection name.
const collection = "galery"

// Create the galery schema.
const schema = new mongoose.Schema({
    image: {type:String, require: true},
    idName: {type:String, require: true},
})

// Compile the galery model.
const model = mongoose.model(collection,schema)

export default model