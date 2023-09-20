const Squeal = require("../schemas/squeal");
const User = require("../schemas/users");
const jwt = require('jsonwebtoken');
const { secretToken } = require("../router_Handler/authenticateToken");
const asyncHandler = require("express-async-handler");

//create a new squeal
exports.new_squeal = asyncHandler( async (req, res, next) =>{
    const squealData = req.body;

    const squeal = new Squeal({

    })
})