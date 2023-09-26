
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

exports.user_update_put = asyncHandler(async (req, res)=>{
    const newDate = req.body;
    const newCreditAvailable = {
        daily: newDate.daily,
        weekly:newDate.weekly ,
        monthly: newDate.monthly
    }

    const updatedUser = await User.findOneAndUpdate( {username:newDate.username}, {

        accountType: newDate.type,
        creditInit: newDate.creditInit,
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
                newRecipient.push(channel.name)
            }
        }

    }

    const updatedSqueal = await Squeal.findByIdAndUpdate( newDate.id, {
            recipients : newRecipient
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

exports.channel_all_get = asyncHandler(async (req, res, next) => {
    const allChannel = await Channel.find().sort({name:1}).exec();
    res.send(allChannel);
})


