const Channel = require("../schemas/channel");
const User = require('../schemas/users')
const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken');
const {getCurrentUserFromToken} = require("../middleware/authenticateToken");
const NewsAPI = require('newsapi');
const Squeal = require("../schemas/squeal");
const {get} = require("mongoose");
const {response} = require("express");
const newsapi = new NewsAPI('9af74ffa3aae452486e2934056d4cd18');
const nasaapi = 'iF8znYFCghEAuSD8cxafNVCLKzwY3a0BLlp8d7ab'
const catapi = 'live_VeKpG4XvaGdzFrm8uay6YSOumz7YcuhLAlStksy0mJyvOYV34Xc1o8mE4EkuY5gt'
exports.channel_create_post = asyncHandler(async (req, res, next) => {
    const channelInfo = req.body;

    var admin
    if (channelInfo.typeOf === 'private') {
        const token = req.headers.authorization;
        admin = await User.findOne({username: getCurrentUserFromToken(token).username}).exec()
    } else {
        admin = await User.findOne({username: 'squealeroffcial'}).exec()
    }
    const existingChannel = await Channel.findOne({name: channelInfo.name});
    if (existingChannel) {
        console.log("channel esistente")
        return res.status(400).json({error: "channel already exists"});
    }

    const channel = new Channel({
        name: channelInfo.name,
        admin: admin._id,
        typeOf: channelInfo.type,
        description: channelInfo.desc,
        members: admin._id
    })
    // await channel.save()

    try {
        await channel.save();
        res.status(200).json({message: "channel created successfully"});

    } catch (error) {
        res.status(500).json({error});

    }
})

exports.subscribe_patch = asyncHandler( async (req, res, next) => {
   try{
       const user = req.user
       const addUser = await User.findOne({username: user.username})
       const chan = await Channel.findOneAndUpdate(
           {_id: req.body.id},
           { $addToSet: { members: addUser}},
           {new: true})
       res.status(200).json({message: "channel subscribed successfully"});
   }catch (error){
       console.log(error)
   }

})

exports.unsubscribe_patch = asyncHandler( async (req, res, next) => {
    try{
        const user = req.user
        const delUser = await User.findOne({username: user.username})
        console.log(delUser)
        const chan = await Channel.findOneAndUpdate(
            {_id: req.body.id},
            { $pull: { members: delUser._id}},
            {new: true})
        res.status(200).json({message: "channel unsubscribed successfully"});
    }catch (error){
        console.log(error)
    }

})
exports.channel_update_patch = asyncHandler(async (req, res, next) => {
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
    if (newDate.newName) {
        var newName = newDate.newName
    }
    const updatedChan = await Channel.findOneAndUpdate({name: newDate.name}, {
        admin: newAdmins,
        name: newName
    }, {
        returnDocument: 'after'
    })
    res.send(updatedChan)
})
exports.channel_block_patch = asyncHandler(async (req, res) => {
    const newDate = req.body;

    const updatedChan = await Channel.findOneAndUpdate({name: newDate.name}, {
        blocked: newDate.block
    }, {
        returnDocument: 'after'
    })
    // res.send(newDate.block ? 'channel blocked' : 'channel unblocked')
    res.send(updatedChan)
})
//Channels

exports.channel_get_user_Official = asyncHandler(async (req, res, next) => {
    const channels = await Channel.find({typeOf: 'official'}).sort({SquealNum: 1})
    res.status(200).send({channels})
})
exports.channel_get_user_Private = asyncHandler(async (req, res, next) => {
    const user = req.user.username
    const curr_user = await User.findOne({username: user}).exec()
    const channelsAll = await Channel.find({typeOf: 'private'}).populate('members', 'username')
        .sort({SquealNum: 1})
    const channelsIn = await Channel.find({typeOf: 'private', members: curr_user})
        .populate('members', 'username')
        .sort({SquealNum: 1})
    res.status(200).send({channelsAll, channelsIn})
})


exports.channel_counSqueals = async (channelName) => {
    const channel = await Channel.findOne({name: channelName})
    const totalSqueals = await Squeal.countDocuments({'squealerChannels': channel._id})
    console.log(totalSqueals)
    const chan = await Channel.findOneAndUpdate({name: channelName},
        {$set: {SquealNum: totalSqueals}},
        {new: true}
    )
}

exports.channel_squeals = asyncHandler(async (req, res, next) => {
    const channelID = req.query.id
    const limit = parseInt(req.query.limit) || 20
    let skip = parseInt(req.query.skip) || 0
    const totalSqueals = await Squeal.countDocuments(req.user ? {} : {'squealerChannels.typeOf': 'official'});
    if (skip >= totalSqueals) {
        skip = Math.max(0, totalSqueals - limit)
    }
    const channel = await Channel.find({_id: channelID}).exec()
    const squeals = await Squeal.find({squealerChannels: channel}).sort({dateTime: -1})
        .limit(limit)
        .skip(skip)
    res.status(200).send({squeals})
})

exports.channel_trending = asyncHandler(async (req, res, next) => {

})

exports.channel_getContenteOfOneChannel = asyncHandler(async (req, res, next) => {

})

exports.channel_NEWSAPI = async () => {
    const mod = await User.findOne({username: 'SquealUfficiale'})
    const newChannel = await Channel.findOne({name: '§NEWS'})
    newsapi.v2.topHeadlines({
        category: 'business',
        language: 'it',
        country: 'it'
    }).then(async response => {
        // console.log(response.articles);
        for (const item of response.articles) {
            const index = response.articles.indexOf(item);
            const squeal = new Squeal({
                sender: mod._id,
                username: mod.username,
                body: item,
                recipients: {
                    keywords: "#TOP_NEWS"
                },
                isPrivate: false,
                squealerChannels: newChannel,
                automaticMessage: true,
            })
            await exports.channel_counSqueals('§NEWS')
            await squeal.save()
        }
    })
}

exports.channel_NasaPicApi = async () => {
    try {
        const mod = await User.findOne({username: 'SquealUfficiale'});
        const newChannel = await Channel.findOne({name: '§NASA'});

        const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${nasaapi}`;

        const response = await fetch(apiUrl);

        if (response.ok) {
            const data = await response.json();
            const squeal = new Squeal({
                sender: mod._id,
                username: mod.username,
                body: data,
                recipients: {
                    keywords: "#NASA"
                },
                isPrivate: false,
                squealerChannels: newChannel,
                automaticMessage: true,
            })
            await squeal.save()
            await exports.channel_counSqueals('§NASA')

        } else {
            console.error(`NASA API failed: ${response.status}`);
        }
    } catch (error) {
        console.error('Error：', error);
    }
}

exports.channel_CatPicApi = async () => {
    try {
        const mod = await User.findOne({username: 'squealerofficial'});
        const newChannel = await Channel.findOne({name: '§CAT'});

        const apiUrl = `https://api.thecatapi.com/v1/images/search?api_key=${catapi}`;

        const response = await fetch(apiUrl);

        if (response.ok) {
            const data = await response.json();
            const squeal = new Squeal({
                sender: mod._id,
                username: mod.username,
                body: {title: 'random cat pic', utl: data[0].url},
                recipients: {
                    keywords: "#CAT"
                },
                isPrivate: false,
                squealerChannels: newChannel,
                automaticMessage: true,
            })
            await squeal.save()
            await exports.channel_counSqueals('§CAT')

        } else {
            console.error(`NASA API failed: ${response.status}`);
        }
    } catch (error) {
        console.error("Errore: ", error);
    }
}


exports.deleteOldNews = async () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 7);
    const chan = await Channel.findOne({name: '§NEWS'})
    Squeal.deleteMany({squealerChannels: chan}, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`Deleted ${result.deletedCount} records from 2 days ago.`);
        }
    })
}
// exports.channel_counSqueals('§NEWS')
// exports.channel_NEWSAPI()
setInterval(async () => {
    await exports.channel_CatPicApi()
    await exports.channel_NasaPicApi()
    await exports.channel_NEWSAPI()
    await exports.deleteOldNews()
}, 3600000);