import mongoose from "mongoose";

mongoose.pluralize(null)

// Mongo collection name.
const collection = "comments"

// Create the comments schema.
const schema = new mongoose.Schema({
    name: {type:String, require: true},
    opinion: {type:String, require: true},
})
// Compile the comments model.
const model = mongoose.model(collection,schema)

export default model