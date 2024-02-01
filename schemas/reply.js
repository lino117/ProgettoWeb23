const mongoose = require("mongoose");

const { Schema } = mongoose;

const replySchema = new Schema({
    squeal: { type: Schema.Types.ObjectId, ref: "Squeal"},
    replyTo: {type: Schema.Types.ObjectId, ref: "Reply"},
    body: { type: String},
    dateTime: {type: Date, default: Date.now},
    user: { type: Schema.Types.ObjectId, ref: "User"},
})

const Reply = mongoose.model('Reply', replySchema);
module.exports = Reply;