const Channel = require("../schemas/channel");
const User = require('../schemas/users')
const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken');
const {  getCurrentUserFromToken } = require("../router_Handler/authenticateToken");

exports.channel_create_post = asyncHandler( async (req, res, next) => {
    const channelInfo = req.body;
    const token =  req.headers.authorization;
    let admin = await User.findOne({username:getCurrentUserFromToken(token)}).exec()

    const existingChannel = await Channel.findOne({ name: channelInfo.name});
    if (existingChannel){
        console.log("channel esistente")
        return res.status(400).json({ error: "channel already exists"});
    }

    const channel = new Channel({
        name: channelInfo.name,
        admin: admin._id,
        typeOf : channelInfo.type,
        labelOfChannel: channelInfo.label,
        members:admin._id
    })
   // await channel.save()

    try {
        await channel.save();
        res.status(200).json({ message: "channel created successfully" });

    } catch (error){
        res.status(500).json({ error});

    }
})
exports.channel_update_patch = asyncHandler(async (req,res,next)=> {
    const newDate = req.body;

    const channel = await Channel.findOne({name: newDate.name}).exec()
    const newAdmins = channel.admin
    if (newDate.addedAdmins) {

        for (const addedAdmin of newDate.addedAdmins) {
            if (newAdmins.indexOf(addedAdmin) === -1) {
                newAdmins.push(addedAdmin)
            }
        }
    }

    if (newDate.deletedAdmins) {
        for (const deletedAdmin of newDate.deletedAdmins) {
            const Index = channel.admin.indexOf(newDate.deletedAdmin)
            newAdmins.splice(Index, 1)
        }
    }
    if (newDate.newName){
        var newName = newDate.newName
    }
    const updatedChan = await Channel.findOneAndUpdate({name:newDate.name},{
        admin : newAdmins,
        name : newName
    },{
        returnDocument:'after'
    })
    res.send(updatedChan)
})
exports.channel_block_patch=asyncHandler (async (req,res)=>{
    const newDate = req.body;

    const updatedChan = await Channel.findOneAndUpdate({name:newDate.name},{
        blocked:newDate.block
    },{
        returnDocument:'after'
    })
    // res.send(newDate.block ? 'channel blocked' : 'channel unblocked')
    res.send(updatedChan)
})