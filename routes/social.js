const express = require("express");
const expressWs = require("express-ws");
const router = express.Router();
const {authenticateToken} = require("../middleware/authenticateToken");
const upload = require("../middleware/fileHandler");
const user_controller = require("../controllers/userController");
const squeal_controller = require("../controllers/squealController");
const reaction_controller = require("../controllers/reactionController")
const mod_controller = require('../controllers/ModController')
const chan_controller = require('../controllers/channelController')
const {user_changePwd_put} = require("../controllers/userController");

//User
// GET listing
router.get("/user_detail", authenticateToken, user_controller.user_detail);
router.get("/get_all_users", mod_controller.user_list);
// POST listing
router.post("/register", user_controller.user_regist_post);
router.post("/dbtest", user_controller.dbtest);
router.post("/login", user_controller.user_login_post);
// PATCH listing
router.patch('/updateUser', mod_controller.user_update_patch)
router.patch('/updateCredit', user_controller.user_changeCredit_patch);
// PUT listing
router.put("/changePassword", authenticateToken, user_changePwd_put);

//Squeal
// GET listing
router.get('/allSqueals', mod_controller.squeal_all_get);
router.get('/singleSqueal', squeal_controller.single_squeal_get);
router.get('/get_all_squeals', squeal_controller.get_squeals);
router.get('/get_image', squeal_controller.image_get);
router.get('/get_views', squeal_controller.views_get)
// POST listing
router.post("/squeal_post", authenticateToken, upload.single('image'), squeal_controller.new_squeal);
router.post("/squeal_reply", authenticateToken,  squeal_controller.reply_post);

// PATCH listing
router.patch('/updateSqueal', mod_controller.squeal_update_patch)
router.patch('/likeSqueal', reaction_controller.squeal_like_patch);
router.patch('/dislikeSqueal', reaction_controller.squeal_dislike_patch);

//PUT listing
router.post('/update_view/', squeal_controller.views_post)

//Channel
// GET listing
router.get('/allChannelO', mod_controller.channelOffi_all_get)
router.get('/allChannelP', mod_controller.channelPriv_all_get)
// POST listing
router.post('/createCh', chan_controller.channel_create_post)
// PATCH listing
router.patch('/updateChannel', chan_controller.channel_update_patch)
router.patch('/blockChannel', chan_controller.channel_block_patch)

module.exports = router;
