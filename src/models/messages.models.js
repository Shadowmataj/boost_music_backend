import mongoose from "mongoose";

mongoose.pluralize(null)

// Mongo collection name.
const collection = "messages"

// Create the messages schema.
const schema = new mongoose.Schema({
    user: { type: String, require: true },
    message: { type: String, require: true }
})

// Compile the messages model.
const model = mongoose.model(collection, schema)

export default model