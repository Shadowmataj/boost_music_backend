import mongoose from 'mongoose';

mongoose.pluralize(null);

// Mongo collection name.
const collection = 'recovery';

// Create the recovery schema.
const schema = new mongoose.Schema({
    email: {type: String, require: true},
    expirationDate: { type: String, require: true},
    status: {type: Boolean, default: true, require: true}
});

// Compile the carts model.
const model = mongoose.model(collection, schema);

export default model;