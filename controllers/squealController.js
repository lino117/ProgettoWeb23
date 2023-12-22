const Squeal = require("../schemas/squeal");
const Channel = require("../schemas/channel");
const User = require("../schemas/users");
const jwt = require('jsonwebtoken');
const {secretToken, getCurrentUserFromToken} = require("../middleware/authenticateToken");
const asyncHandler = require("express-async-handler");

const {upload} = require('../middleware/fileHandler');
const {squeal} = require("../middleware/users");

const mention = /@(\w+)/;
const keyword = /#\w+/g;
const channel_reserved = /§[A-Z]+/g;
const channel_normal = /§[a-z]+/g;
//create a new squeal
exports.new_squeal = asyncHandler(async (req, res, next) => {

    const image = (req.file) ? req.file.filename : null;
    console.log(image);
    const squealData = req.body.body;
    console.log(squealData)
    const destinatari = req.body.destinatari;
    const token = req.headers.authorization;

    let singleUser = (destinatari.match(mention)) ? destinatari.match(mention)[1] : null;
    console.log(singleUser)
    let recipients = [];
    let keywords = destinatari.match(keyword);
    let channel = destinatari.match(channel_normal);
    if (keywords) {
        recipients = recipients.concat(keywords);
    }
    if (channel) {
        recipients = recipients.concat(channel);
    }
    const reiceverValid = await User.findOne({username: singleUser}).exec();
    if (!reiceverValid) {
        res.status(500).json({message: "user mentioned not exist"})
    }
    const [sender, channelInDB] = await Promise.all([
        User.findOne({username: getCurrentUserFromToken(token)}).exec(),
        Channel.findOne({name: channel})
    ]);//
    const squeal = new Squeal({
        sender: sender._id,
        username: sender.username,
        body: squealData,
        recipients: (singleUser) ? singleUser : recipients,
        isPrivate: (squealData.match(mention) !== null || true),
        squealerChannels: channelInDB,
        image: image
    })
    try {
        await squeal.save();
        res.status(200).json({message: req.body});
        // console.log(res)
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "An error occurred while posting the squeal"});
    }
})

exports.get_squeals = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization;
    let squealsToShow;
    const channels = await Channel.find({receiverOfChannel: "official"}).select("name");
    if (token) {
        squealsToShow = await Squeal.find().sort({dateTime: -1}).exec();
    } else {
        squealsToShow = await Squeal.find({
            squealerChannels: {$in: channels}
        });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Squeal.countDocuments();
    const pagination = {
        total,
        limit
    };
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }
    squealsToShow = await Squeal.find().sort({dateTime: -1}).limit(limit).skip(startIndex).exec();
    res.send({
        success: true,
        count: squealsToShow.length,
        pagination,
        data: squealsToShow
    
});

})

exports.squeal_like_patch = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization;
    const squealID = req.body.id;
    if (token) {
        const user = await User.findOne({username: getCurrentUserFromToken(token)}).select("hasLiked");
        console.log(user)
        if (user.hasLiked.includes(squealID)) {
            return res.json({ message: "Already liked", liked: true });
        } else {
            const squeal = await Squeal.findById(squealID);
            if (!squeal) {
                return res.status(404).json({message: "Squeal not found"});
            }
            squeal.reaction.like += 1;
            user.hasLiked.push(squealID)
            await user.save()
            await squeal.save();
            return res.status(200).json({liked: true});
        }


    }


})

exports.squeal_dislike_patch = asyncHandler(async (req, res, next) => {
    const squealID = req.body.id;
    const squeal = await Squeal.findById(squealID);
    if (!squeal) {
        return res.status(404).json({message: "Squeal not found"});
    }
    squeal.reaction.dislike += 1;
    const updatedSqueal = await squeal.save();
    return res.status(200).json(updatedSqueal);

})

