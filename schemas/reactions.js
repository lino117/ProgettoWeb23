const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const reactionSchema = new Schema({
    message: { type: Schema.Types.ObjectId, ref: "Squeal", required: true},
    impressionX: { type: Number, required: true},
    reactions: {
        positive: { type: Number, required: true},
        negative: { type: Number, required: true},
    },
    criticalMass: { type: Number, required: true},
    label: {
        type: String,
        enum: ['popolare', 'impopolare', 'controverso'],
        required: true,
    },
    userPerformance: {
        isConsistentlyPopular: Boolean,
        isConsistentlyUnpopular: Boolean,
        popularityIncrease: Number,
        popularityDecrease: Number,
    },
    controversial: Boolean,
});


const Reaction = mongoose.model('Reaction', reactionSchema);
module.exports =  Reaction;