const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema({
    nickname:{type:String},
    image: { type: String},
    username: { type: String, required: true},
    password: { type: String, required: true},
    //da completare
    accountType: {
        type : String,
        enum: ['nor','vip','smm','mod'],
        default: 'nor'
    },
    creditInit: { type: Number, min: 0},
    creditAvailable: {
        daily: {type: Number, default: 0, min:0},
        weekly:{type: Number, default: 0, min: 0},
        monthly:{type: Number, default: 0, min: 0},
    },
    hasLiked: { type: [String]},
});

const User = mongoose.model('User', userSchema);
module.exports = User;