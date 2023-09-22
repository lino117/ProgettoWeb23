const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema({
    firstName: String,
    familyName: String,
    username: { type: String, required: true},
    password: { type: String, required: true},
    //da completare
    isPro: { type: Boolean, default: false},
    proType: { type: String, enum: ["VIP", "SMM", "ADMIN"]},
    creditTot: { type: Number, min: 0},
    creditAvailable: { type: Number, required: true, default: 0},

});

const User = mongoose.model('User', userSchema);
module.exports = User;