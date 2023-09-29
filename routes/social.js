const express = require("express");
const router = express.Router();
const {authenticateToken} = require("../middleware/authenticateToken");
const upload = require("../middleware/fileHandler");
const user_controller = require("../controllers/userController");
const squeal_controller = require("../controllers/squealController");
const mod_controller = require('../controllers/ModController')
const chan_controller = require('../controllers/channelController')


//User
    // GET listing
router.get("/user_detail", authenticateToken, user_controller.user_detail);
router.get("/get_all_users", mod_controller.user_list);
    // POST listing
router.post("/register", user_controller.user_regist_post);
router.post("/dbtest", user_controller.dbtest);
router.post("/login", user_controller.user_login_post);
    // PATCH listing
router.patch('/updateUser',mod_controller.user_update_patch)

//Squeal
    // GET listing
router.get('/allSqueals',mod_controller.squeal_all_get)
    // POST listing
router.post("/squeal_post", authenticateToken,upload.single('image'), squeal_controller.new_squeal);
    // PATCH listing
router.patch('/updateSqueal',mod_controller.squeal_update_patch)


//Channel
    // GET listing
router.get('/allChannelO',mod_controller.channelOffi_all_get)
router.get('/allChannelP',mod_controller.channelPriv_all_get)
    // POST listing
router.post('/createCh',chan_controller.channel_create_post)
    // PATCH listing
router.patch('/updateChannel',chan_controller.channel_update_patch)
router.patch('/blockChannel',chan_controller.channel_block_patch)

module.exports = router;
