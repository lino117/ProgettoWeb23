const mongoose = require("mongoose");

const { Schema } = mongoose;

const requestSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: "User"},
    receiver: { type: Schema.Types.ObjectId, ref: "User"},
    isAccepted: { type: Boolean }
})

const Request = mongoose.model('Request', requestSchema);
module.exports = Request;