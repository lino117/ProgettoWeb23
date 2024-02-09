const User = require("../schemas/users");
const Squeal = require("../schemas/squeal");
const Channel = require('../schemas/channel')
const SMMreq = require('../schemas/request')
const asyncHandler = require("express-async-handler");
const {log} = require("debug");

exports.choosePart = asyncHandler(async (req, res) => {
    const whoBeChosen = req.body.beChosenPart
    const whoChoose = req.body.toChoosePart

    const updatedChoosePart = await User.findByIdAndUpdate(whoChoose, {
        choosedUser: whoBeChosen
    }, {
        returnDocument: 'after'
    })
    res.status(200).send(updatedChoosePart)

})
exports.changePart = asyncHandler(async (req, res) => {
    const whoReplace = req.body.toReplacePart
    const whoChange = req.body.toRemovePart

    const updatedChoosePart = await User.findByIdAndUpdate(whoChange, {
        choosedUser: whoReplace
    }, {
        returnDocument: 'after'
    })
    res.status(200).send(updatedChoosePart)
})

exports.getVIP = asyncHandler(async (req, res) => {
    try {
        const smm = req.user
        const vip = req.query.vip
        const user = await User.findOne({username: smm.username}).exec();
        const vipUser = await User.findOne({username: vip})
        const vipUserSqueals = await Squeal.find({sender: vipUser})
        const resData = {vipUser, vipUserSqueals}
        if (vipUser === null) {
            const error = new Error("User not found");
            error.status = 404;

        }
        res.send(resData);
    } catch (error) {
        console.log(error)
    }


})

exports.monitoring = asyncHandler(async (req, res) => {
    const vipID = req.query.vipID
    const squeals = await Squeal.find({sender: vipID}).lean();
    const resultSqueals = {
        reactionSortSqueals: squeals.slice().sort((a, b) => (b.reaction.like + b.reaction.dislike) - (a.reaction.like + a.reaction.dislike)),
        popularSortSqueals: squeals.slice().sort((a, b) => b.popularity - a.popularity),
        riskUnpopSqueals: [],
        riskControvSqueals: []
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
        const user = await User.findOne({username: userlogged.username})
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
        const user = await User.findOne({username: userlogged.username})
        console.log(user)
        if (user.accountType === 'smm') {
            const req_list = await SMMreq.find({receiver: user, isAccepted: {$ne: true}})
                .populate({path: "sender", select: "username"})
            res.status(200).json({requests: req_list})
        } else {
            res.status(500).json({messagge: 'non sei un utente SMM'})

        }
    } catch (error) {
        console.log(error)
    }
})

exports.acceptReq = asyncHandler(async (req, res) => {
    const requestID = req.body.request
    const user = req.user

    const reqBody = await SMMreq.findOne({_id: requestID})
    const senderID = reqBody.sender

    const vip = await User.findOne({_id: senderID})

    console.log(vip)
    const smm = await User.findOne({username: user.username})
    try {
        if (vip.choosedUser && vip.choosedUser.equals(smm._id)) {
            reqBody.isAccepted = true;
            await reqBody.save()

            res.status(200).json({response: 'hai già accettato'})
        } else {
            vip.choosedUser = smm;
            reqBody.isAccepted = true;
            await vip.save()
            await reqBody.save()
            res.status(200).json({response: 'hai accettato'})
        }

    } catch (error) {
        console.log(error)
    }

})

exports.removeSMM = asyncHandler(async (req, res, next) => {
    try {
        const user = req.user
        const curr_user = await User.updateOne({username: user.username},
            {$unset: {choosedUser: ''}})
        res.send(curr_user)

    } catch (error) {
        console.log(error)
    }
})
