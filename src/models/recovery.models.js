import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'recovery';
// const collection = 'users_aggregate';

const schema = new mongoose.Schema({
    email: {type: String, require: true},
    expirationDate: { type: String, require: true},
    status: {type: Boolean, default: true, require: true}
});


const model = mongoose.model(collection, schema);

export default model;