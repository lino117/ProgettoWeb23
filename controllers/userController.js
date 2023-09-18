const User = require("../schemas/users");
const Squeal = require("../schemas/squeal");
const asyncHandler = require("express-async-handler");
const {  validationResult } = require("express-validator");

//get the list of all users
exports.user_list = asyncHandler(async (req, res, next) => {
    const allUsers = await User.find().sort({username: 1}).exec();
    res.send(allUsers);
})

exports.user_detail = asyncHandler(async (req, res, next) => {
    const [user, allSquealByUser] = await Promise.all([
        User.findById(req.params.username).exec(),
        Squeal.find({user: req.params.username}, "summary").exec(),
    ]);
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
    const existingUser = await User.findOne(userInfo.username);
    if (existingUser){
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

    const user = new User({
        firstName: "wow",
        familyName: "wow",
        username: "wow",
        password: "wow",
        userType: "VIP",
        creditTot: 10,
        creditAvailable: 10
    });
    try {
        await user.save();
        res.status(200).json({ message: "user created successfully", user });

    } catch (error){
        res.status(500).json({ error: "An error occurred while creating the " });

    }


})
