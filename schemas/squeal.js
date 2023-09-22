const mongoose = require("mongoose");
// const Channel = require("./channel");
const { Schema, model } = mongoose;

const squealSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: "User"},

    body: { type: String, required: true},// Può essere testo, immagine, video o geolocazione
    recipients: {
        type: [String], // Elenco di destinatari (individui, canali o keyword)
    },
    dateTime: {
        type: Date,
        default: Date.now, // Data ed ora del messaggio non modificabili
    },
    isPrivate: { type: Boolean, default: false},
    popularity: {
        type: String,
        enum: ['popolare', 'impopolare', 'controverso'], // Categoria del messaggi
    },
    squealerChannels: {
        type: [{
            type:Schema.Types.ObjectId, ref: "Channel"}], // Canali Squealer a cui è stato aggiunto dalla redazione
    },
    automaticMessage: { type: Boolean,  default: false},
    geo: { type: String },
    reaction: {
        type: Number,
        like: { type: Number },
        dislike: { type: Number},
        impression: { type: Number },
        CM: { type: Number}
    },

});


const Squeal = mongoose.model('Squeal', squealSchema);
module.exports =  Squeal;