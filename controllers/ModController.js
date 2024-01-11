
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
        newUser.push(updatedUser)
        // console.log(updatedUser)
    }

    // res.send(updatedUser)

    res.send(newUser)
    // res.status(200).send(body)
})

exports.squeal_all_get = asyncHandler(async (req, res, next) => {

    const allSqueals = await Squeal.find().sort({dateTime:1}).limit(3).exec();
    console.log(allSqueals)
    res.send(allSqueals);
})
arrayEqual= async (arrayA, arrayB)=>{
     return JSON.stringify(arrayA)  !==  JSON.stringify(arrayB)
}
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

exports.channelOffi_all_get = asyncHandler(async (req, res, next) => {
    const allOffChannel = await Channel.find({typeOf:'official'}).sort({name:1}).exec();
    res.send(allOffChannel);
})
exports.channelPriv_all_get = asyncHandler(async (req, res, next) => {
    const allPrivChannel = await Channel.find({typeOf:'private'}).sort({name:1}).exec();
    res.send(allPrivChannel);
})




