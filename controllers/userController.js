const User = require("../schemas/users");
const Squeal = require("../schemas/squeal");
const asyncHandler = require("express-async-handler");
const {  validationResult } = require("express-validator");
const jwt = require('jsonwebtoken');
const { secretToken } = require("../router_Handler/authenticateToken");

//get the list of all users
exports.user_list = asyncHandler(async (req, res, next) => {
    const allUsers = await User.find().sort({username: 1}).exec();
    res.send(allUsers);
})

//non è necessario alcun param, se l'utente è loggato, ritorna tutti i campi
//includere jwt nell'header Authorization
exports.user_detail = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token.replace('Bearer ', ''), secretToken);

    const currentUser = decoded.username;
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

exports.user_create_post = asyncHandler(async (req, res, next) =>{
    const userInfo = req.body;
    console.log(userInfo);
    const existingUser = await User.findOne({ username: userInfo.username});
    if (existingUser){
        console.log("utente esistente")
        return res.status(400).json({ error: "user already exists"});

    }
    const user = new User({
        firstName: userInfo.firstName,
        familyName: userInfo.familyName,
        username: userInfo.username,
        password: userInfo.password,
        userType: userInfo.userType,
        creditTot: userInfo.creditTot,
        creditAvailable: userInfo.creditAvailable
    });
    try {
        await user.save();
        res.status(200).json({ message: "user created successfully" });

    } catch (error){
        res.status(500).json({ error: "An error occurred while creating the " });

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

exports.user_detail