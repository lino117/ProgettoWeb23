const asyncHandler = require("express-async-handler");
const User = require("../schemas/users");
const {getCurrentUserFromToken} = require("../middleware/authenticateToken");
const Squeal = require("../schemas/squeal");
exports.squeal_like_patch = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization;
    const squealID = req.body.id;
    try {
        if (token) {
            const user = await User.findOne({username: getCurrentUserFromToken(token)}).select("hasLiked");
            console.log(user)
            if (user.hasLiked.includes(squealID)) {
                return res.json({ message: "Already liked", liked: true });
            } else {
                const squeal = await Squeal.findById(squealID);
                if (!squeal) {
                    return res.status(404).json({message: "Squeal not found"});
                }
                squeal.reaction.like += 1;
                user.hasLiked.push(squealID)
                await user.save()
                await squeal.save();
                return res.status(200).json({liked: true});
            }

        }
    } catch (error) {
        console.log(error)
    }



})

exports.squeal_dislike_patch = asyncHandler(async (req, res, next) => {
    const squealID = req.body.id;
    const squeal = await Squeal.findById(squealID);
    if (!squeal) {
        return res.status(404).json({message: "Squeal not found"});
    }
    squeal.reaction.dislike += 1;
    const updatedSqueal = await squeal.save();
    return res.status(200).json(updatedSqueal);

})

