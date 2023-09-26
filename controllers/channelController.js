const Channel = require("../schemas/channel");
const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken');
const {  getCurrentUserFromToken } = require("../middleware/authenticateToken");

exports.channel_create_post = asyncHandler( async (req, res, next) => {
    const channelInfo = req.body;
})