import mongoose from "mongoose";

mongoose.pluralize(null)

const collection = "comments"

const schema = new mongoose.Schema({
    
})

const model = mongoose.model(collection,schema)

export default model