const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const User = require("../schemas/users");

const channelSchema = new Schema({
    name: String,
    admin: [{ type: Schema.Types.ObjectId, ref: "User"}],
    typeOf: {
        type: String,
        enum: [ "private", "official"],
    },
    labelOfChannel: {type: String},
    followers: { type: Number, min: 0,default: 1},
    isUnmuteable:{type: Boolean, default:false},
    members: [{ type: Schema.Types.ObjectId, ref: "User"}],
    SquealNum:{type:Number, default:0},
    blocked:{type:Boolean,default:false}
});


const Channel = mongoose.model('Channel', channelSchema);
module.exports =  Channel;