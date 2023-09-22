const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const User = require("../schemas/users");

const channelSchema = new Schema({
    name: String,
    owner: [{ type: Schema.Types.ObjectId, ref: "User"}],
    receiverOfChannel: {
        type: String,
        enum: [ "official", "reserved"],
        required: true
    },
    typeOfChannel: {
        type: String,
        enum: [ "trending", "random", "important", "controversial"]

    },
    isUnmuteable: Boolean,

});


const Channel = mongoose.model('Channel', channelSchema);
module.exports =  Channel;