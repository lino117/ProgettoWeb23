const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema({
    firstName: String,
    familyName: String,
    username: { type: String, required: true},
    password: { type: String, required: true},
    //da completare
    userType: { type: String, enum: ["Normale", "VIP"]},
    creditTot: { type: Number, min: 0},
    creditAvailable: { type: Number, required: true},

});

const User = mongoose.model('User', userSchema);
module.exports = User;