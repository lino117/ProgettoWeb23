const Channel = require("../schemas/channel");
const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken');
const {  getCurrentUserFromToken } = require("../middleware/authenticateToken");
const User = require("../schemas/users");

exports.channel_create_post = asyncHandler( async (req, res, next) => {
    const channelInfo = req.body;
    const token = req.headers.authorization;
    const [creator] = await Promise.all([
        User.findOne({username: getCurrentUserFromToken(token)}).exec(),
    ]);//
    const channel = new Channel({
        name: channelInfo.name,
        admin: creator._id,
        receiverOfChannel: "official",
        labelOfChannel: channelInfo.label,

    })
    try {
        await channel.save();
        res.status(200).json({ message: "channel created successfully"});
    } catch (error){
        console.log(error);
        res.status(500).json({ error: "An error occurred while creating the channel" });
    }
})