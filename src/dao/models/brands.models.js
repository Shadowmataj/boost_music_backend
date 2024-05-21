import mongoose from "mongoose";

mongoose.pluralize(null)

const collection = "brands"

const schema = new mongoose.Schema({
    
})

const model = mongoose.model(collection,schema)

export default model