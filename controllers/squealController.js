const Squeal = require("../schemas/squeal");
const Channel = require("../schemas/channel");
const User = require("../schemas/users");
const Reply = require("../schemas/reply");
const View = require('../schemas/views');
const mongoose = require('mongoose')
const fs = require('fs');
const io = require("../controllers/socketController")
const jwt = require('jsonwebtoken');
const {secretToken, getCurrentUserFromToken} = require("../middleware/authenticateToken");
const asyncHandler = require("express-async-handler");

const {upload} = require('../middleware/fileHandler');
const {squeal} = require("../middleware/users");
const {join, resolve} = require("path");
const path = require("path");

const mention = /@(\w+)/;
const keyword = /#(\w+)/;
const channel_reserved = /§[A-Z]+/g;
const channel_normal = /§[a-z]+/g;
//create a new squeal
exports.new_squeal = asyncHandler(async (req, res, next) => {
    const image = (req.file) ? req.file.filename : null;
    console.log("image", image);
    const squealData = req.body.body;
    console.log(squealData)
    const destList = req.body.destinatari;
    const destArray = destList.split(' ');
    console.log(destArray)
    const channel = req.body.channel
    const token = req.headers.authorization;
    let destUsers = [];
    let destKeywords = []
    if (destArray.length === 1 && destArray[0].match(mention)) {
        let singleUser = destArray[0].match(mention)
        const reiceverValid = await User.findOne({username: singleUser[1]}).exec();
        console.log("received valid", reiceverValid)
        if (reiceverValid) {
            destUsers.push(reiceverValid)
        } else {
            res.status(500).json({message: "user mentioned not exist"})
            return
        }
    } else {
        for (const elem of destArray) {
            let keywords = elem.match(keyword);
            let users = elem.match(mention);
            console.log("keywords", keywords, " users", users)
            if (keywords) {
                destKeywords.push(keywords[0])
            }
            if (users) {
                const user = await User.findOne({username: users[1]}).exec();
                destUsers.push(user)

            }
        }
    }


    const [sender, channelInDB] = await Promise.all([
        User.findOne({username: getCurrentUserFromToken(token)}).exec(),
        Channel.findOne({name: channel})
    ]);//
    const squeal = new Squeal({
        sender: sender._id,
        username: sender.username,
        body: squealData,
        recipients: {
            users: destUsers,
            keywords: destKeywords
        },
        isPrivate: destUsers.length === 1,
        squealerChannels: channelInDB,
        image: image
    })
    try {
        await squeal.save();
        // console.log(res)

        res.status(200).json({message: req.body});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "An error occurred while posting the squeal"});
    }
})

exports.get_squeals = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization;
    let squealsToShow;
    if (token) {
        jwt.verify(token.replace('Bearer ', ''), secretToken, (err, user) => {
            if (err) {
                return res.status(403).json({error: 'Invalid token'});
            }
        })
        squealsToShow = await Squeal.find().sort({dateTime: -1}).exec();
    } else {
        squealsToShow = await Squeal.find({'squealerChannels.typeOf': 'official'}).populate('squealerChannels');
    }
    res.send(squealsToShow);
})

exports.single_squeal_get = asyncHandler(async (req, res) => {
    const id = req.query.id
    console.log(id)
    const Squealbody = await Squeal.find({_id: id}).exec()
    res.send(Squealbody)
})

exports.image_get = asyncHandler(async (req, res) => {
    const filename = req.query.image
    const imagePath = join(path.resolve(__dirname, '..'), 'public/images', filename)
    console.log(filename)
    console.log(imagePath)
    res.sendFile(imagePath)
})

exports.reply_post = asyncHandler(async (req, res, next) => {
    const squealID = req.body.id;
    const text = req.body.text;
    const replyTo = req.body.replyTo ? req.body.replyTo : null
    const squeal = await Squeal.findById(squealID);
    if (squeal) {
        const reply = new Reply({
            squeal: squealID,
            replyTo: replyTo,
            body: text,
        })
        try {
            await reply.save();
            squeal.replies.push(reply._id)
            await squeal.save();
            res.status(200).json({message: reply});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "An error occurred while posting the reply"});
        }
    }
})

exports.search_get = asyncHandler(async (req, res, next) => {
    const word = req.query.word;


})

exports.views_post = asyncHandler(async (req, res, next) => {
    const squeal = await Squeal.findById(req.body.id)
    console.log(req.body.id)
    if (!squeal) {
        return res.status(404).json({error: "Squeal not found"})
    }
    const view = await View.find({squeal: squeal._id}).exec()
    console.log("view result:", view)

    if (view.length === 0) {
        const viewNew = new View({
            squeal: squeal._id,
            view: Date.now(),
        })
        await viewNew.save()
        return res.json({view: view})

    } else {
        const viewUpdate = await View.findOne({_id: view})
        viewUpdate.view.push(Date.now())
        console.log(viewUpdate)
        await viewUpdate.save()
        return res.json({view: viewUpdate})

    }
})

exports.views_get = asyncHandler(async (req, res, next) => {
    const squealId = req.query.id;

    const today = new Date().toISOString().split('T')[0];

    try {
        // 在数据库中查找与Squeal ID匹配的记录
        const squealData = await View.findOne({squeal: squealId});

        if (!squealData) {
            return res.status(404).json({error: 'Squeal not found'});
        }

        // 统计今天日期在view数组中出现的次数
        const today = new Date().toISOString().split('T')[0];
        const lastWeekStart = new Date(new Date() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const lastMonthStart = new Date(new Date() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const todayCount = squealData.view.filter(item => item.toISOString().split('T')[0] === today).length;
        const lastWeekCount = squealData.view.filter(item => item.toISOString().split('T')[0] >= lastWeekStart).length;
        const lastMonthCount = squealData.view.filter(item => item.toISOString().split('T')[0] >= lastMonthStart).length;

        return res.json({
            squealId,
            todayCount,
            lastWeekCount,
            lastMonthCount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }

})