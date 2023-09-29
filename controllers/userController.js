const User = require("../schemas/users");
const Squeal = require("../schemas/squeal");
const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken');
const {secretToken, getCurrentUserFromToken} = require("../middleware/authenticateToken");
// const bcrypt = require("bcrypt");

//non è necessario alcun param, se l'utente è loggato, ritorna tutti i campi
//includere jwt nell'header Authorization
exports.user_detail = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization;
    // const decoded = jwt.verify(token.replace('Bearer ', ''), secretToken);

    const currentUser = getCurrentUserFromToken(token);

    console.log('Current user:', currentUser);


    // console.log(userId);
    const [user, allSquealByUser] = await Promise.all([
        User.findOne({username: currentUser}).exec(),
        Squeal.find({username: currentUser}, "summary").exec(),
    ]);
    console.log(user)
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

exports.user_regist_post = asyncHandler(async (req, res, next) => {
    const userInfo = req.body;

    console.log(userInfo);
    const existingUser = await User.findOne({username: userInfo.username});
    if (existingUser) {
        console.log("utente esistente")
        return res.status(400).json({error: "user already exists"});

    }
    const user = new User({
        nickname: userInfo.username,
        username: userInfo.username,
        password: userInfo.password,
        userType: userInfo.userType,
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
        const { oldPassword, newPassword } = req.body;

        const user = await User.findOne({ username: currentUser});
        const passwordMatch = oldPassword === user.password;
        console.log(user.password)
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Password sbagliata' });
        }
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password cambiata' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore mentre cambiare la password', error: error.message });
    }

}



exports.user_login_post = asyncHandler(async (req, res, next) => {
    const userInfo = req.body;
    const loguser = await User.findOne({username: userInfo.username}).exec();

    if (userInfo.username !== loguser.username ||
        userInfo.password !== loguser.password) {
        res.send({
            status: 400,
            message: "Nome utente o password errato",
        });
    }

    const token = jwt.sign({username: userInfo.username}, "tecweb2223", {
        // expiresIn: "1h",
    });
    res.send({
        status: 200,
        message: "Logged successfully",
        token: token,
    })

})

exports.chooseSMM = asyncHandler(async (req, res) => {

})
exports.changeSMM = asyncHandler(async (req, res) => {

})
exports.chooseVIP = asyncHandler(async (req, res) => {

})
exports.changeVIP = asyncHandler(async (req, res) => {

})


//