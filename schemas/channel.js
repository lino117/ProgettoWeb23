const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const User = require("../schemas/users");

const channelSchema = new Schema({
    name: String,
    admin: [{ type: Schema.Types.ObjectId, ref: "User"}],
    receiverOfChannel: {
        type: String,
        enum: [ "official", "reserved"],
        required: true
    },
    labelOfChannel: {
        type: String,
    },
    followers: { type: Number, min: 0, default: 0},
    isUnmuteable: Boolean,
    members: [{ type: Schema.Types.ObjectId, ref: "User"}]
});


const Channel = mongoose.model('Channel', channelSchema);
module.exports =  Channel;