import mongoose from "mongoose";

mongoose.pluralize(null)

const collection = "artists"

const schema = new mongoose.Schema({
    name: {type:String, require: true},
    description: {type:String, require: true}
})

const model = mongoose.model(collection,schema)

export default model