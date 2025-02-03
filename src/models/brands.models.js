import mongoose from "mongoose";

mongoose.pluralize(null)

// Mongo collection name.
const collection = "brands"

// Create the brand schema.
const schema = new mongoose.Schema({
    name: {type:String, require: true},
    description: {type:String, require: true},
    image:  {type:String, require: true},
    classconten: {type:String, enum: ['contenedor_martis', 'contenedor_martis_invertido'], default: "contenedor_martis", require: true},
    textposition: {type:String, enum: ['texto-martis', "texto-martis-invertido"], default: "texto-martis", require: true}
})

// Compile the brands model.
const model = mongoose.model(collection,schema)

export default model