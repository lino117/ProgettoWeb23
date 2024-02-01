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
const {log} = require("debug");
const repl = require("repl");

const mention = /@(\w+)/;
const keyword = /#(\w+)/;
const channel_reserved = /§[A-Z]+/g;
const channel_normal = /§[a-z]+/g;
//create a new squeal
exports.new_squeal = asyncHandler(async (req, res, next) => {
    const image = (req.file) ? req.file.filename : null;
    console.log("image", image);
    const squealData = req.body.body;
    const automaticMessage = req.body.automaticMessage;
    console.log(squealData)
    const destList = req.body.destinatari;
    const destArray = destList ? destList.split(' ') : null;
    console.log(destArray)
    const coords = {
        longitude: req.body.longitude,
        latitude: req.body.latitude
    }
    const channel = req.body.channel
    const currentUser = req.user.username
    let destUsers = [];
    let destKeywords = []
    if (destArray) {
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
    }

    const [sender, channelInDB] = await Promise.all([
        User.findOne({username: currentUser}),
        Channel.findOne({name: channel}),
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
        automaticMessage: automaticMessage,
        image: image
    })
    // if (coords.longitude !== undefined && coords.latitude !== undefined) {
    //     squeal.geo = {
    //         type: 'Point',
    //         coordinates: [coords.longitude, coords.latitude]
    //     };
    // }
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
    const limit = parseInt(req.query.limit) || 100
    const skip = parseInt(req.query.skip) || 0
    let squealsToShow;
    const totalSqueals = await Squeal.countDocuments(req.user ? {} : {'squealerChannels.typeOf': 'official'});
    if (skip >= totalSqueals){
        skip = Math.max(0, totalSqueals - limit)
    }
    console.log(req.user)
    if (req.user) {

        squealsToShow = await Squeal.find()
            .sort({dateTime: -1})
            .limit(limit)
            .skip(skip)
            .exec();
    } else {
        squealsToShow = await Squeal.find({'squealerChannels.typeOf': 'official'}).populate('squealerChannels')
            .limit(limit)
            .skip(skip)
        ;
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
    console.log(req.body)
    const user = req.user.username
    const text = req.body.text;
    const replyTo = req.body.replyTo ? req.body.replyTo : null
    const squeal = await Squeal.findById(squealID);
    const sender = await User.find({username: user})
    console.log(sender)
    try {
        if (squeal) {
            const reply = new Reply({
                squeal: squealID,
                replyTo: replyTo,
                body: text,
                user: sender[0]
            })

            await reply.save();
            squeal.replies.push(reply._id)
            await squeal.save();
            res.status(200).json({message: reply});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "An error occurred while posting the reply"});
    }
})

exports.reply_get = asyncHandler(async (req, res, next) => {
    const info = req.query;
    // console.log(info.id)
    let i = 0
    let userRes = []
    const reply = await Reply.find({squeal: info.id})
    for (i = 0; i < reply.length; i++) {
        console.log(reply[i].user)
        userRes[i] = await User.find({_id: reply[i].user}).select('_id image', )
        console.log(userRes[i])
    }
    // userRes[0] = await User.findOne({_id: reply[3].user})
    console.log(userRes[i])

    console.log(reply[0])

    const resData = {userRes, reply}
    try {
        res.status(200).json(resData)
    } catch (error) {
        res.status(500).json({error: "An error occurred while getting the reply"});

        console.log(error);
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
        squeal.reaction.impression += 1;
        squeal.reaction.CM = squeal.reaction.impression * 0.25
        await squeal.save()
        await viewNew.save()
        return res.json({view: view})

    } else {
        const viewUpdate = await View.findOne({_id: view})
        viewUpdate.view.push(Date.now())
        console.log(viewUpdate)
        squeal.reaction.impression += 1;
        squeal.reaction.CM = squeal.reaction.impression * 0.25

        await squeal.save()
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