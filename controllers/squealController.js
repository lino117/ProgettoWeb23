const Squeal = require("../schemas/squeal");
const Channel = require("../schemas/channel");
const User = require("../schemas/users");
const jwt = require('jsonwebtoken');
const { secretToken, getCurrentUserFromToken} = require("../middleware/authenticateToken");
const asyncHandler = require("express-async-handler");
const mention = /@\w+/;
const keyword = /#\w+/g;
const channel_reserved = /§[A-Z]+/g;
const channel_normal = /§[a-z]+/g;
//create a new squeal
exports.new_squeal = asyncHandler( async (req, res, next) =>{
    const squealData = req.body.body;
    const destinatari = req.body.destinatari;
    const token =  req.headers.authorization;
    let keywords = destinatari.match(keyword);
    let channel = destinatari.match(channel_normal);
    let singleUser = (destinatari.match(mention))?destinatari.match(mention)[0] : null;
    let recipients = keywords.concat(channel);
    const [sender,channelInDB] = await Promise.all([
        User.findOne({username: getCurrentUserFromToken(token)}).exec(),
        channelInDB.findOne({ name: channel })
    ]);//
    const squeal = new Squeal({
        sender: sender._id,
        body: squealData,
        recipients: (singleUser) ? singleUser : recipients,
        isPrivate: (squealData.match(mention) !== null || ''),
        squealerChannels: channel,
    })
    try {
        await squeal.save();
        res.status(200).json({ message: "squeal posted successfully"});
    } catch (error){
        console.log(error);
        res.status(500).json({ error: "An error occurred while posting the squeal" });
    }
})
