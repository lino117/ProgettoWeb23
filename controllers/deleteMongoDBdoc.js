
const User = require("../schemas/users");
const Squeal = require("../schemas/squeal");
const Channel = require('../schemas/channel')
const {ObjectId} = require("mongodb");


exports.deletMany = async (req,res)=>{
    const deletedNum = await Squeal.deleteMany({
        dateTime: {$lt : new Date('2024-01-01')}
    })

    res.send(deletedNum)
}
exports.updateMany = async (req,res)=>{
    await Squeal.updateMany({},{sender: new ObjectId('65b262275045fa9222b06c8b')})
}