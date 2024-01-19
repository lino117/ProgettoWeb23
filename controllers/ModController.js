
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
arrayEqual= async (arrayA, arrayB)=>{
    return JSON.stringify(arrayA)  !==  JSON.stringify(arrayB)
}

//get the list of all users
exports.user_list = asyncHandler(async (req, res, next) => {
    const showNumber = (req.query.showNumber)

    const allUsers = await User.find().sort({username: 1}).limit(showNumber).exec();

    res.send(allUsers);
})
exports.filter_user_list = asyncHandler(async (req,res)=>{
    const userFilter = req.query.filter
    const filter ={}
    if (userFilter.filterName){
        filter.username = new RegExp(userFilter.filterName, 'gi')
    }
    if ( parseInt(userFilter.filtPop) !== 0){
        filter.filtRule = userFilter.filtRule
        filter.filtPop =userFilter.filtPop
    }
    if (userFilter.filtType){
        filter.accountType=userFilter.filtType
    }
    var allUsers
    if(filter){
         allUsers  = await User.find(filter).sort({username: 1}).limit(userFilter.showNumber).exec()
    }else {
         allUsers  = await User.find().sort({username: 1}).limit(userFilter.showNumber).exec()

    }
    res.send(allUsers)
})
exports.user_update_patch = asyncHandler(async (req, res)=>{
    const newDate = req.body;
    var newCredit = {
        newDaily:undefined,
        newWeekly:undefined,
        newMonthly:undefined,
    }
    var newUser = []
    for (const user of newDate) {
        const utente = await User.findOne({username:user.username}).exec()

        newCredit.newDaily = parseInt(user.daily!==0 ? user.daily : utente.creditAvailable.daily)
        newCredit.newWeekly = parseInt(user.weekly!==0 ? user.weekly : utente.creditAvailable.weekly)
        newCredit.newMonthly = parseInt(user.monthly!==0 ? user.monthly : utente.creditAvailable.monthly)

        const updatedUser = await User.findOneAndUpdate( {username:user.username}, {

            // accountType: newDate.type,
            // creditInit: newDate.creditInit,
            creditAvailable:{
                daily: newCredit.newDaily,
                weekly:newCredit.newWeekly ,
                monthly: newCredit.newMonthly
            }
        },
        {
           returnDocument : 'after',
        }
        )
        newUser.push(updatedUser.username)
        // console.log(updatedUser)
    }

    // res.send(updatedUser)

    res.send(newUser)
    // res.status(200).send(body)
})
exports.channelSqueal_get = asyncHandler(async (req,res)=>{
    const channelName = req.query.channelName
    const channel= await Channel.findOne({name:channelName}).exec()
    // mongoose.populate 用于 得到那个obj id的信息， 比如正常的话是显示 obj，id， 如果有populate那个field， 那就会显示那个obj，id的所有信息
    const channelSqueal = await Squeal.find({squealerChannels :channel._id} ).sort({dateTime:1}).limit(3).exec()

    res.send(channelSqueal)
})
exports.squeal_all_get = asyncHandler(async (req, res, next) => {
    const showNumber =req.query.showNumber
    const allSqueals = await Squeal.find().sort({dateTime:1}).limit(showNumber).exec();
    console.log(allSqueals)
    res.send(allSqueals);
})
exports.squeal_update_patch = asyncHandler( async (req, res)=>{
    const newDate = req.body;
    var noRecipFound = []
    var resultSqueal =[]
    var newReaction = {
        newLike:0,
        newDislike: 0,
        newImpression:0
    }
    // per ogni squeal che hanno subito la modifica
    for (const newSqueal of newDate) {
        var newRecipientsArray = []
        const squeal = await Squeal.findById(newSqueal.squealID).exec()
        // verificare se nuovi dati numeri siano !0, altrimenti assegnare valore vecchio
        newReaction.newLike = (newSqueal.likeNumber!==0 ? newSqueal.likeNumber: squeal.reaction.like)
        newReaction.newDislike = (newSqueal.dislikeNumber!==0 ? newSqueal.dislikeNumber: squeal.reaction.dislike)
        newReaction.newImpression = (newSqueal.visitNumber!==0 ? newSqueal.visitNumber: squeal.reaction.impression)

        //se array destinatari non e vuota e i dest siano cambiati, allora
        if (newSqueal.newRecipients && !arrayEqual(newSqueal.newRecipients,squeal.recipients) ) {
            //per ogni destinatario presente in array, cercare se esiste poi formare nuovo array destinatari
            for (const addRecipient of newSqueal.newRecipients) {
                // prova se nuovo dest e un canale uff o pri
                if (await Channel.findOne({name: addRecipient}).exec()) {
                    newRecipientsArray.push(addRecipient)
                }
                // poi prova se e un utente, possibilmente da togliere @ in caso se ci fosse con regex
                else if (await User.findOne({username:addRecipient}).exec()) {
                    newRecipientsArray.push(addRecipient)
                }
                // qua da completare else if guardando se inizia con un # per un 'canale' non registrato(qua da fare con regex)
                // se non e nessuno dei 3 casi precedenti
                else {
                    noRecipFound.push(addRecipient)
                }

            }

        }else{
            newRecipientsArray=squeal.recipients
        }
        // per ogni squeal, aggiorna
        const updatedSqueal = await Squeal.findByIdAndUpdate(newSqueal.squealID, {
                recipients: newRecipientsArray,
                reaction: {
                    like: parseInt(newReaction.newLike),
                    dislike: parseInt(newReaction.newDislike),
                    impression: parseInt(newReaction.newImpression)
                },
                automaticMessage : newSqueal.automatic
            },
            {
                returnDocument: 'after',
            }
        )
       resultSqueal.push(updatedSqueal)
    }
    const noChannelMsg = (noRecipFound? 'ci sono alcuni canali non esistenti'+noRecipFound : '')
    res.send(resultSqueal)
})
exports.addSquealChannel = asyncHandler(async (req,res)=> {
    channelName = req.body.channelName
    squealID = req.body.squealID
    const channel = await Channel.findOne({name: channelName}).exec()
    channelID= channel._id
    const squeal = await Squeal.findByIdAndUpdate(squealID, {
            squealerChannels: channelID
        }, {
            returnDocument: 'after'
        }
    )

    console.log(squeal)
    res.send(squeal)
})
exports.delSquealChannel = asyncHandler(async (req,res)=>{
    squealID = req.body.squealID
    const squeal = await Squeal.findByIdAndUpdate(squealID,{
        squealerChannels: null
    }, {
        returnDocument: 'after'
    })

    res.send(squeal)
})
exports.channelOffi_all_get = asyncHandler(async (req, res, next) => {
    const showNumber =parseInt(req.query.showNumber)
    const allOffChannel = await Channel.find({typeOf:'official'}).sort({name:1}).limit(showNumber).exec();
    res.send(allOffChannel);
})
exports.channelPriv_all_get = asyncHandler(async (req, res, next) => {
    const showNumber =parseInt(req.query.showNumber)
    const allPrivChannel = await Channel.find({typeOf:'private'}).sort({name:1}).limit(showNumber).exec();
    res.send(allPrivChannel);
})
exports.channelOffi_delete_put =asyncHandler (async (req,res)=>{
    const channelIDs = req.body
    console.log(channelIDs)
    var deletedChannel=[]
    for (const channelID of channelIDs) {
        const channel = await Channel.findById(channelID).exec()
        deletedChannel.push(channel.name)
        await Channel.findByIdAndDelete(channelID).exec()

    }
    res.send(deletedChannel)
})
exports.channelOff_update_patch = asyncHandler(async (req,res)=>{
    const channelInfo = req.body
    var updatedChannel = []
    for (const newInfos of channelInfo) {
        const channel = await Channel.findOneAndUpdate({name:newInfos.channelName},{
            description : newInfos.description
        })
        updatedChannel.push(channel.name)
    }
    res.send(updatedChannel)

})



