
const User = require("../schemas/users");
const Squeal = require("../schemas/squeal");
const Channel = require('../schemas/channel')
const asyncHandler = require("express-async-handler");

 joinSchema = async (mainSchema,secSchema,localField,foreignField,nameTable)=>{
     mainSchema.aggregate([
         {
             $lookup: {
                 from: secSchema,
                 localField: localField,
                 foreignField: foreignField,
                 as: nameTable,
             },
         },
     ])
 }

//get the list of all users
exports.user_list = asyncHandler(async (req, res, next) => {
    const allUsers = await User.find().sort({username: 1}).exec();
    res.send(allUsers);
})

exports.user_update_patch = asyncHandler(async (req, res)=>{
    const newDate = req.body;

    const updatedUser = await User.findOneAndUpdate( {username:newDate.username}, {

        accountType: newDate.type,
        creditInit: newDate.creditInit,
        creditAvailable:{
            daily: newDate.daily,
            weekly:newDate.weekly ,
            monthly: newDate.monthly
        }
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
exports.squeal_update_patch = asyncHandler( async (req, res)=>{
    const newDate = req.body;

    // controlla prima se ci sono delle modifiche altrimenti non fa nulla
    // if (newDate.deletedRecipient || newDate.addedRecipient ) {

    const squeal = await Squeal.findById(newDate.id).exec()

    var newRecipient = squeal.recipients

    if (newDate.deletedRecipient) {
        const IndexDelRecip = squeal.recipients.indexOf(newDate.deletedRecipient)
        newRecipient.splice(IndexDelRecip, 1)
    }

    if (newDate.addedRecipient){

        for (const addRecipient of newDate.addedRecipient) {
            const channel = await Channel.findOne({name:addRecipient}).exec()
            if (channel) {
                if (newRecipient.indexOf(channel.name) === -1) {
                    newRecipient.push(channel.name)
                }
                // } else {
                //     res.status(400).json('channel gia presente nei destinatari')}
            }
            // } else {
            //     res.status(401).json('channel inesistente')
            // }
        }

    }

    const updatedSqueal = await Squeal.findByIdAndUpdate( newDate.id, {
            recipients : newRecipient,
            reaction: {
                like : parseInt(newDate.like),
                dislike : parseInt(newDate.dislike)
            }
        },
        {
            returnDocument : 'after',
        }
    )
    res.send(updatedSqueal)
    // }
    //
    // res.send('nulla succeed')
})

exports.channelOffi_all_get = asyncHandler(async (req, res, next) => {
    const allOffChannel = await Channel.find({typeOf:'official'}).sort({name:1}).exec();
    res.send(allOffChannel);
})
exports.channelPriv_all_get = asyncHandler(async (req, res, next) => {
    const allPrivChannel = await Channel.find({typeOf:'private'}).sort({name:1}).exec();
    res.send(allPrivChannel);
})




