const mongoose = require("mongoose");

const { Schema } = mongoose;

const viewsSchema = new Schema({
    squeal: { type: Schema.Types.ObjectId, ref: "Squeal"},
    view: {
        type: [Date]
    },

})

const View = mongoose.model('View', viewsSchema);
module.exports = View;