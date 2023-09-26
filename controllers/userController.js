const User = require("../schemas/users");
const Squeal = require("../schemas/squeal");
const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken');
const {  getCurrentUserFromToken } = require("../router_Handler/authenticateToken");




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
    if ( user === null){
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

exports.user_regist_post = asyncHandler(async (req, res, next) =>{
    const userInfo = req.body;
    const userCredit = {
        daily : userInfo.creditInit,
        weekly:userInfo.creditInit * 7,
        monthly: userInfo.creditInit *30
    }
    console.log(userInfo);
    const existingUser = await User.findOne({ username: userInfo.username});
    if (existingUser){
        console.log("utente esistente")
        return res.status(400).json({ error: "user already exists"});

    }
    const user = new User({
        surname: userInfo.surname,
        name: userInfo.name,
        username: userInfo.username,
        password: userInfo.password,
        userType: userInfo.userType,
        creditInit: userInfo.creditInit,
        creditAvailable: userCredit
    });
    try {
        await user.save();
        res.status(200).json({ message: "user created successfully" });

    } catch (error){
        res.status(500).json({ error: "An error occurred while creating the user" });

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
        res.status(200).json({ message: "user created successfully", user });

    } catch (error){
        res.status(500).json({ error: "An error occurred while creating the " });

    }


})

exports.user_login_post = asyncHandler(async (req, res, next) =>{
    const userInfo = req.body;
    const loguser = await User.findOne({ username: userInfo.username});
    if (   userInfo.username !== loguser.username ||
           userInfo.password !== loguser.password ){
        res.send({
            status: 400,
            message: "Nome utente o password errato",
        });
    }

    const token = jwt.sign({ username: userInfo.username}, "tecweb2223",{
        expiresIn: "1h",
    });
    res.send({
        status: 200,
        message: "Logged successfully",
        token: token,
    })

})

exports.chooseSMM = asyncHandler(async (req,res)=>{

})
exports.changeSMM = asyncHandler(async (req,res)=>{

})
exports.chooseVIP = asyncHandler(async (req,res)=>{

})
exports.changeVIP = asyncHandler(async (req,res)=>{

})


//