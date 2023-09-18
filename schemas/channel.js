const mongoose = require("mongoose");
const { Schema, model } = mongoose;


const channelSchema = new Schema({
    name: String,
    receiverOfChannel: {
        type: String,
        enum: [ "private", "reserved"],
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