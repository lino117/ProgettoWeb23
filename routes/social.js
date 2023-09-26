const express = require("express");
const router = express.Router();
const {authenticateToken} = require("../middleware/authenticateToken");
const upload = require("../middleware/fileHandler");
const user_controller = require("../controllers/userController");
const squeal_controller = require("../controllers/squealController");
const mod_controller = require('../controllers/ModController')
const channel_controller = require("../controllers/channelController");
router.post('/upload', upload.single('image'), (req, res) => {
    // 文件上传成功后的处理逻辑
    res.send('文件上传成功');
});

router.post("/create_channel", channel_controller.channel_create_post);
router.post("/register", user_controller.user_regist_post);
router.post("/dbtest", user_controller.dbtest);
router.post("/login", user_controller.user_login_post);
router.get("/user_detail", authenticateToken, user_controller.user_detail);
router.get("/get_all_users", mod_controller.user_list);
router.post("/squeal_post", authenticateToken, upload.single('image'), squeal_controller.new_squeal);

router.get('/allSqueals',mod_controller.squeal_all_get)
router.get('/allChannel',mod_controller.channel_all_get)

router.put('/updateUser',mod_controller.user_update_put)
router.put('/updateSqueal',mod_controller.squeal_update_put)
module.exports = router;
