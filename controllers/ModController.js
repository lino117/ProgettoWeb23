
const User = require("../schemas/users");
const Squeal = require("../schemas/squeal");
const Channel = require('../schemas/channel')
const asyncHandler = require("express-async-handler");

//get the list of all users
exports.user_list = asyncHandler(async (req, res, next) => {
    const allUsers = await User.find().sort({username: 1}).exec();
    res.send(allUsers);
})

exports.user_update_put = asyncHandler(async (req, res)=>{
    const newDate = req.body;

    const newCreditAvailable = {
        daily: newDate.daily,
        weekly:newDate.weekly ,
        monthly: newDate.monthly
    }

    const updatedUser = await User.findOneAndUpdate( {username:newDate.username}, {

        accountType: newDate.type,
        creditInit:newDate.creditInit,
        creditAvailable:newCreditAvailable
    },
    {
       returnDocument : 'after',
    }
    )
    res.send(updatedUser)
})

exports.squeal_all_get = asyncHandler(async (req, res, next) => {
    const allSqueals = await Squeal.find().sort({dateTime:1}).exec();
    res.send(allSqueals);
})
exports.squeal_update_put = asyncHandler( async (req,res)=>{
    const newDate = req.body;

    const updatedSqueal = await Squeal.findOneAndUpdate( {username:newDate.username}, {


        },
        {
            returnDocument : 'after',
        }
    )
    res.send(updatedSqueal)
})


