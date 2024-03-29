
const User = require("../schemas/users");
const Squeal = require("../schemas/squeal");
const Channel = require('../schemas/channel')
const asyncHandler = require("express-async-handler");


arrayEqual=  (arrayA, arrayB)=>{
    return JSON.stringify(arrayA)  !==  JSON.stringify(arrayB)
}
checkLastPage = async (schema,filter,skipNum,showNumber, sortField)=>{
    var lastPageFlag = false

    const lastPage =  await schema.aggregate([
        {
            $match: Object.keys(filter).length > 0 ? filter : {}
        },
        {
            $skip : parseInt(skipNum)
        },
        {
            $count : 'total'
        },
    ])
    if (lastPage[0]){
        if (lastPage[0].total < showNumber){
            return true
        }
    }
    return false
}
getResults =async (schema,filter,skipNum,showNumber, sortField)=>{
    const sortObject = {};
    if (sortField === 'dateTime'){
        sortObject[sortField] = -1;
    }else{
        sortObject[sortField] = 1;
    }

    return await schema.aggregate([

        {
            $match: Object.keys(filter).length > 0 ? filter : {}

        },
        {
            $sort: sortObject
        },
        {
            $skip: parseInt(skipNum)
        },
        {
            $limit: parseInt(showNumber)
        }
    ])
}

//get the list of all users
exports.user_list = asyncHandler(async (req, res, next) => {
    const userFilter = req.query.userFilter
    const filter ={}
    const skipNum = userFilter.pageNum > 0 ? (userFilter.pageNum - 1) * userFilter.showNumber : 0
    var popArray = []
    const popFilrNum = parseInt(userFilter.filtPop)
    if (userFilter.filterName){
        filter.username = new RegExp(userFilter.filterName, 'gi')
    }
    // filtrare per la popolarita indica che il numero di squeal POPULAR avuti.
    // e.g. popNum = 10, selezionare solo gli users che hanno squeal populare maggiore di 10
    if ( popFilrNum !== 0){
        var popFilter
        if(userFilter.filtRule === 'gte'){
             popFilter={$gte : popFilrNum}
        }else{
             popFilter={$lte : popFilrNum}
        }
        const squealPopular = await Squeal.aggregate([
            {
                $group : {
                    _id :{
                        sender:'$sender',
                        popularity:'$popularity'
                    },
                    count : {$sum:1},
                }
            },
            {
                $match : {
                    'count' : popFilter,
                    '_id.popularity' : 'popolare'
                }
            },
            {
                $sort :{ sender : 1}
            },

        ])
        for (const userID of squealPopular) {
            popArray.push(userID._id)
        }
        filter._id = {$in:popArray}
    }

    if (userFilter.filtType){
        filter.accountType=userFilter.filtType
    }
    const lastPageFlag =  await checkLastPage(User,filter,skipNum,userFilter.showNumber)
    const data = await getResults(User,filter,skipNum,userFilter.showNumber,'username')
    res.send( {users:data, IsLastPage:lastPageFlag} )
})
exports.squeal_all_get = asyncHandler(async (req, res, next) => {
    const squealFilter = req.query.squealFilter
    const skipNum = squealFilter.pageNum > 0 ? (squealFilter.pageNum - 1) * squealFilter.showNumber : 0
    var authorsArray = []
    var recipArray= []
    const filter={}
    if (squealFilter.autor) {
        regexAutor = new RegExp(squealFilter.autor, 'gi')
        autors = await User.find({username: regexAutor}, {_id: 1}).lean()
        for (const autor of autors) {
            authorsArray.push(autor._id)
        }
        filter.sender =  { $in: authorsArray }
    }


    if(squealFilter.recipient){
        recipArray.push(new RegExp(squealFilter.recipient,'gi'))
        filter.recipient=  { $in: recipArray }

    }

    var endTime = squealFilter.endTime ? new Date(squealFilter.endTime) : new Date()
    endTime.setHours(24)
    endTime.setMinutes(59)
    endTime.setSeconds(59)
    var startTime = squealFilter.startTime ? new Date(squealFilter.startTime) : new Date('2024-01-01')

    filter.dateTime = {
        $lte: endTime,
        $gte: startTime
    }

    const lastPageFlag =  await checkLastPage(Squeal,filter,skipNum,squealFilter.showNumber)
    const data = await getResults(Squeal,filter,skipNum,squealFilter.showNumber,'dateTime')

    await User.populate(data,{path:'sender'})
    await User.populate(data,{path:'recipients.users'})
    await User.populate(data,{path:'recipients.channels'})

    console.log(data)
    res.status(200).send( {squeals:data, IsLastPage:lastPageFlag} )

})
exports.channelOffi_all_get = asyncHandler(async (req, res, next) => {
    const offFilter = req.query.offFilter
    const filter ={
        typeOf :'official'
    }
    const skipNum = offFilter.pageNum > 0 ? (offFilter.pageNum - 1) * offFilter.showNumber : 0

    const lastPageFlag =  await checkLastPage(Channel,filter,skipNum,offFilter.showNumber)
    const data = await getResults(Channel,filter,skipNum,offFilter.showNumber,'name')
    await User.populate(data,{path:'admin'})

    res.status(200).send( {data:data, IsLastPage:lastPageFlag} )


})
exports.channelPriv_all_get = asyncHandler(async (req, res, next) => {
    const privateFilter = req.query.privateFilter
    const filter ={
        typeOf :'private'
    }
    const skipNum = privateFilter.pageNum > 0 ? (privateFilter.pageNum - 1) * privateFilter.showNumber : 0

    const lastPageFlag =  await checkLastPage(Channel,filter,skipNum,privateFilter.showNumber)
    const data = await getResults(Channel,filter,skipNum,privateFilter.showNumber,'name')
    await User.populate(data,{path:'admin'})

    res.status(200).send( {data:data, IsLastPage:lastPageFlag} )

})


exports.channelSqueal_get = asyncHandler(async (req,res)=>{
    const channelName = req.query.channelName
    const channel= await Channel.findOne({name:channelName}).exec()
    const channelSqueal = await Squeal.find({squealerChannels :channel._id} )
        .sort({dateTime:1}).populate('sender').exec()
    res.send(channelSqueal)
})
exports.noChannelSqueal_get = asyncHandler(async (req,res)=>{
    const squeals = await Squeal.find({
        squealerChannels:null
    }).populate('sender').exec()
    console.log(squeals)
    res.status(200).send(squeals)
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
    }

    // res.send(updatedUser)

    res.send(newUser)
    // res.status(200).send(body)
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
    squealIDs = req.body.squealIDs
    console.log(req.body)
    const channel = await Channel.findOne({name: channelName}).exec()
    console.log(channel)
    channelID= channel._id
    var data = []
    for (const squealID of squealIDs) {
        const squeal = await Squeal.findByIdAndUpdate(squealIDs, {
                squealerChannels: channelID
            }, {
                returnDocument: 'after'
            }
        )
        data.push(squeal)
    }
    res.status(200).send('Gli squeals selezionati son stati aggiunti con successo')
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
exports.channelOffi_delete_put =asyncHandler (async (req,res)=>{
    const channelIDs = req.body
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



