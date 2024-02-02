const User = require("../schemas/users");
const Squeal = require("../schemas/squeal");
const Channel = require('../schemas/channel')
const asyncHandler = require("express-async-handler");
const {log} = require("debug");

exports.choosePart = asyncHandler(async (req,res)=>{
    const whoBeChosen = req.body.beChosenPart
    const whoChoose = req.body.toChoosePart

    const updatedChoosePart = await User.findByIdAndUpdate(whoChoose,{
        choosedUser : whoBeChosen
    },{
        returnDocument:'after'
    })
    res.status(200).send(updatedChoosePart)

})
exports.changePart=asyncHandler(async (req,res)=>{
    const whoReplace = req.body.toReplacePart
    const whoChange = req.body.toRemovePart

    const updatedChoosePart = await User.findByIdAndUpdate(whoChange,{
        choosedUser : whoReplace
    },{
        returnDocument:'after'
    })
    res.status(200).send(updatedChoosePart)
})

exports.getVIP = asyncHandler(async (req,res)=>{
    const smm = req.user
    const vip = req.body.vipUser
    const user = await User.findOne({username: currentUser.username}).exec();
    const vipUser = await User.findOne({ username: vip}).exec()
    if (user === null) {
        const error = new Error("User not found");
        error.status = 404;
        return
    }
    res.send(vipUser);

})

exports.monitoring = asyncHandler(async (req,res)=>{
    const vipID = req.query.vipID
    const squeals = await Squeal.find({ sender: vipID }).lean();
    const resultSqueals = {
        reactionSortSqueals: squeals.slice().sort((a, b) => (b.reaction.like + b.reaction.dislike) - (a.reaction.like + a.reaction.dislike)),
        popularSortSqueals : squeals.slice().sort((a, b) => b.popularity - a.popularity),
        riskUnpopSqueals :[],
        riskControvSqueals:[]
    }
    // viene controllato se campo popularity non esiste
    for (const squeal of squeals) {
        // ce comunque il rischio che uno impopolre o popolare diventi controversie
        // e quindi anche uno controversie puo diventare popolare o impopolare
        if (!squeal.popularity) {


            // se impression = 100 quindi cm = 100 * 0.25 = 25
            // per essere impopolare dislike = 16,
            const reaction = squeal.reaction
            const dislikeIndex = reaction.CM - reaction.dislike
            const likeIndex = reaction.CM - reaction.like
            // se entrambi indici siano minore di 10, allora ce rischio di controversie
            // altrimenti se solo indice di dislike e minore di 10 allora  rischio di impopolare
            if (dislikeIndex <= 10 && likeIndex <= 10) {
                resultSqueals.riskControvSqueals.push(squeal)
            } else if (dislikeIndex <= 10) {
                resultSqueals.riskUnpopSqueals.push(squeal)
            }
            // se entrambi indici siano negativi , vuol dire che questo squeal e gia controversie
            // oppure se indice di dislike e negativo significa che e gia impopolare
        }
    }
    res.status(200).send(resultSqueals)


})

exports.VIP_list_get = asyncHandler(async (req, res) => {
    const userlogged = req.user
    try {
         const user = await User.findOne({ username: userlogged.username})
        console.log(user)
        if (user.accountType === 'smm') {
            const vips = await User.find({accountType: "vip", choosedUser: user})

            res.status(200).json({vips: vips})
        } else {
            res.status(500).json({messagge: 'non sei un utente SMM'})

        }
    } catch (error) {
        console.log(error)
    }
})

exports.VIP_req_list = asyncHandler(async (req, res) => {
    const userlogged = req.user
    try {
        const user = await User.findOne({ username: userlogged.username})
        console.log(user)
        if (user.accountType === 'smm') {
            const req_list = await Request.find({receiver: user, isAccepted:{$ne: true}})
            res.status(200).json({requests: req_list})
        } else {
            res.status(500).json({messagge: 'non sei un utente SMM'})

        }
    } catch (error) {
        console.log(error)
    }
})

exports.acceptReq = asyncHandler(async (req, res) => {
    const request = req.body.request
    const user = req.user
    const smm = User.findOne({username: user.username})
    const reqBody = Request.findOne({sender: request.sender, receiver: smm})

    if (request.accept === true){
        const vip = User.findOne({_id: request.sender})
        vip.choosedUser = smm;
        reqBody.isAccepted = true;
        await vip.save()
        await reqBody.save()
    }
})



