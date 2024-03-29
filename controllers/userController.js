const User = require("../schemas/users");
const Squeal = require("../schemas/squeal");
const SMMreq = require("../schemas/request")
const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken');
const {secretToken, getCurrentUserFromToken} = require("../middleware/authenticateToken");
const {join} = require("path");
const path = require("path");
// const bcrypt = require("bcrypt");

//non è necessario alcun param, se l'utente è loggato, ritorna tutti i campi
//includere jwt nell'header Authorization
exports.user_detail = asyncHandler(async (req, res, next) => {

    let currentUser = req.user
    console.log('Current user:', currentUser);
    if (req.query.user){ currentUser = req.query.user}

    // console.log(userId);
    const user = await User.findOne({username: currentUser.username})
        .populate("choosedUser");
    const allSquealByUser = await Squeal.find({sender: user})
    console.log(allSquealByUser)
    if (user === null) {
        const error = new Error("User not found");
        error.status = 404;
        return next(error);
    }
    const userData = {
        user: user,
        squeals: allSquealByUser,
    };
    res.send(userData);
})

exports.user_another = asyncHandler(async (req, res, next) => {
    const username = req.body.username

    console.log(user)
    const user = await User.findOne({username: username})
    if (user === null) {
        const error = new Error("User not found");
        error.status = 404;
        return next(error);
    } else {
        const userData = {
            username: user.username,

        }
    }
    const userData = {
        user: user,
        squeals: allSquealByUser,
    };
    res.send(userData);
})
exports.user_regist_post = asyncHandler(async (req, res, next) => {
    const userInfo = req.body;
    console.log(userInfo)
    const existingUser = await User.findOne({username: userInfo.username});
    if (existingUser) {
        console.log("utente esistente")
        return res.status(400).json({error: "user already exists"});

    }
    const user = new User({
        nickname: userInfo.username,
        username: userInfo.username,
        password: userInfo.password,
        accountType: userInfo.accountType,
        creditInit: userInfo.creditInit,
        creditAvailable: {
            daily: userInfo.creditInit,
            weekly: userInfo.creditInit * 7,
            monthly: userInfo.creditInit * 30
        }
    });
    try {
        await user.save();
        res.status(200).json({message: "user created successfully",});

    } catch (error) {
        res.status(500).json({error: "An error occurred while creating the user", error: error.message});

    }

});

exports.dbtest = asyncHandler(async (req, res, next) => {
    const userInfo = req.body;
    console.log(userInfo);
    console.log(userInfo.username);
    const user = new User({
        username: userInfo.username,
        password: userInfo.password,
        creditTot: userInfo.creditTot,
        creditAvailable: userInfo.creditAvailable
    });
    console.log(user.username)
    try {
        await user.save();
        res.status(200).json({message: "user created successfully", user});

    } catch (error) {
        res.status(500).json({error: "An error occurred while creating the "});

    }


})

exports.user_changePwd_put = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const currentUser = getCurrentUserFromToken(token);
        const {oldPassword, newPassword} = req.body;

        const user = await User.findOne({username: currentUser});
        const passwordMatch = oldPassword === user.password;
        console.log(user.password)
        if (!passwordMatch) {
            return res.status(401).json({message: 'Password sbagliata'});
        }
        user.password = newPassword;
        await user.save();

        res.status(200).json({message: 'Password cambiata'});

    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Errore mentre cambiare la password', error: error.message});
    }

}


exports.user_login_post = asyncHandler(async (req, res, next) => {
    const userInfo = req.body;
    console.log(userInfo.username)
    const loguser = await User.findOne({username: userInfo.username});
    if (loguser === null) {
        return res.status(404).send("User non esistente")
    } else {
        console.log(loguser)
        if (userInfo.username !== loguser.username ||
            userInfo.password !== loguser.password) {
            res.send({
                status: 400,
                message: "Nome utente o password errato",
            });
        }
        const token = jwt.sign({
            username: loguser.username, accountType: loguser.accountType
        }, secretToken, {
            // expiresIn: "1h",
        });
        res.send({
            status: 200,
            message: "Logged successfully",
            token: token,
            accountType: loguser.accountType
        })
    }


})

exports.user_changeCredit_patch = asyncHandler(async (req, res) => {
    const currentUser = req.user.username
    const value =  Number(req.body.value)
    console.log('currentUser', currentUser)

    console.log(value)
    const user = await User.findOne({username: currentUser});

    user.creditAvailable.daily += value
    user.creditAvailable.weekly += value
    user.creditAvailable.monthly += value


    await user.save()
    res.send({
        status: 200,
        message: "Posted successfully",
        credit: user.creditAvailable,
    })

})

exports.avatar_change = asyncHandler(async (req, res, next) => {
    const avatar = req.file.filename
    console.log(avatar)
    const token = req.headers.authorization;
    console.log(getCurrentUserFromToken(token))
    try {
        const user = await User.findOne({username: getCurrentUserFromToken(token).username})
        console.log(user)
        user.image = avatar
        console.log(user)
        user.save()
        res.status(200).json({message: "profilo aggiornato con successo"});

    } catch (error) {
        console.log(error);
        res.status(500).json({error: error})
    }
})

exports.avatar_get = asyncHandler(async (req, res, next) => {
    const userid = req.query.user
    const user = await User.findOne({_id: userid}).select('image')
    const filename = user.image
    const imagePath = join(path.resolve(__dirname, '..'), 'public/avatars', filename)
    console.log(filename)
    console.log(imagePath)
    res.sendFile(imagePath)
})


exports.SMM_list_get = asyncHandler(async (req, res) => {
    const user1 = req.user
    let user;
    try {
        user = await User.findOne({username: user1.username})
        if (user.accountType === 'vip') {
            const smms = await User.find({accountType: "smm"}).select('username')
            res.status(200).json({smms})
        } else {
            res.status(500).json({messagge: 'non sei un utente VIP'})

        }
    } catch (error) {
        console.log(error)
    }


})
exports.chooseSMM_request_post = asyncHandler(async (req, res) => {
    const userid = req.user
    //use smm's _id
    const SMM = req.body.receiver

    try {
        const user = await User.findOne({username: userid.username})
        if (user.accountType === 'vip') {
            const smm = await User.findOne({username: SMM})
            console.log(smm)
            const req_mana = new SMMreq({
                sender: user,
                senderName: user.username,
                receiver: smm
            })
            await req_mana.save()
            res.status(200).json({message: "domanda mandata con successo"})
        }
    } catch (error) {
        console.log(error)
    }
})



