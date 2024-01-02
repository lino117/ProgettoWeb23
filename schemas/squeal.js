const mongoose = require("mongoose");
// const Channel = require("./channel");
const { Schema } = mongoose;

const squealSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: "User"},
    username: { type: String},
    body: { type: String, required: true},// Può essere testo, immagine, video o geolocazione
    recipients: {
        // Elenco di destinatari (individui, canali o keyword)
        users:{ type: [Schema.Types.ObjectId], ref: "User"},
        keywords: { type: [String]}
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
        type: [{type:Schema.Types.ObjectId, ref: "Channel"}], // Canali Squealer a cui è stato aggiunto dalla redazione
    },
    automaticMessage: { type: Boolean,  default: false},
    geo: { type: String },

    reaction: {
        like: { type: Number, default: 0 },
        dislike: { type: Number, default: 0},
        impression: { type: Number , default: 0},
        CM: { type: Number, default: 0}
    },
    image: {type: String},
    replies: { type: [Schema.Types.ObjectId], ref: "Reply"},


});


const Squeal = mongoose.model('Squeal', squealSchema);
module.exports =  Squeal;