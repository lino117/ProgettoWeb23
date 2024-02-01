const User = require("../schemas/users");
const Squeal = require("../schemas/squeal");
const Channel = require('../schemas/channel')
const asyncHandler = require("express-async-handler");

exports.choosePart = asyncHandler(async (req,res)=>{
    const whoBeChosen = req.body.beChosenPart
    const whoChoose = req.body.toChoosePart

    const updatedChoosePart = await User.findByIdAndUpdate(whoChoose,{
        choosedUser : whoBeChosen
    },{
        returnDocument:'after'
    })
    res.status(200).send(updatedChoosePart)

})
exports.removePart=asyncHandler(async (req,res)=>{
    const whoRemove = req.body.toRemovePart

    const updatedChoosePart = await User.findByIdAndUpdate(whoRemove,{
        choosedUser : undefined
    },{
        returnDocument:'after'
    })
    res.status(200).send(updatedChoosePart)
})

exports.getPart = asyncHandler(async (req,res)=>{
    const partID = req.query.partID
    const foundUser = await User.findById(partID).populate('choosedUser').exec()

    res.status(200).send(foundUser)

})
exports.smmSquealForVIP = asyncHandler( async (req,res)=>{
    const response = await axios.post(url, body, { headers });

})