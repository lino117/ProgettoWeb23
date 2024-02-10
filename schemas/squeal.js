const mongoose = require("mongoose");
const {ObjectId} = require("mongodb");
const Channel = require("./channel");
const {Schema} = mongoose;

const squealSchema = new Schema({
    sender: {type: Schema.Types.ObjectId, ref: "User"},
    username: {type: String},
    body: {type: Schema.Types.Mixed, required: true},// Può essere testo, immagine, video o geolocazione
    recipients: {
        // Elenco di destinatari (individui, canali o keyword)
        users: {type: [Schema.Types.ObjectId], ref: "User"},
        channels: {type: [Schema.Types.ObjectId], ref: "Channel"},
        keywords: {type: [String]}
    },
    dateTime: {
        type: Date,
        default: Date.now, // Data ed ora del messaggio non modificabili
    },
    isPrivate: {type: Boolean, default: false},
    popularity: {
        type: String,
        enum: ['popolare', 'impopolare', 'controverso'], // Categoria del messaggi
    },
    squealerChannels: {type: Schema.Types.ObjectId, ref: "Channel"}, // Canali Squealer a cui è stato aggiunto dalla redazione

    automaticMessage: {type: Boolean, default: false},
    geo: {
        type: {
            type: String,
            enum: ['Point'],
            required: false,
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: false
        }
    },

    reaction: {
        like: {type: Number, default: 0},
        dislike: {type: Number, default: 0},
        impression: {type: Number, default: 0},
        CM: {type: Number, default: 0}
    },
    image: {type: String},
    replies: {type: [Schema.Types.ObjectId], ref: "Reply"},


});

squealSchema.index({geo: '2dsphere'});
const Squeal = mongoose.model('Squeal', squealSchema);
module.exports = Squeal;