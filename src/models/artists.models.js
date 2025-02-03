import mongoose from "mongoose";

mongoose.pluralize(null)

// Mongo collection name.
const collection = "artists"

// Create the artists schema.
const schema = new mongoose.Schema({
    name: {type:String, require: true},
    description: {type:String, require: true}
})

// Compile the artists model.
const model = mongoose.model(collection,schema)

export default model