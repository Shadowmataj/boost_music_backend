import mongoose from 'mongoose';
import mongoosePaginate from "mongoose-paginate-v2"

mongoose.pluralize(null);

const collection = 'users_complete';
// const collection = 'users_aggregate';

const schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, index: false },
    age: { type: Number, required: true},
    password: { type: String, required: true },
    cart: {type: mongoose.Schema.Types.ObjectId, require: false, ref: "carts", default: []},
    role: { type: String, enum: ['admin', 'user', 'premium'], default: 'user' },
    documents: {type:[{name: String , reference: String }], default: [], require: true},
    lastConnection: { type: String, required: false}

})
schema.plugin(mongoosePaginate)

const model = mongoose.model(collection, schema);

export default model;