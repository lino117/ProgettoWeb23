const mongoose = require("mongoose");

const { Schema } = mongoose;

const SMMreqSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: "User"},
    receiver: { type: Schema.Types.ObjectId, ref: "User"},
    isAccepted: { type: Boolean }
})

const SMMreq = mongoose.model('SMMreq', SMMreqSchema);
module.exports = SMMreq;