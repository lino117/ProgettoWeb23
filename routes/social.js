const express = require("express");
const router = express.Router();
const {authenticateToken} = require("../router_Handler/authenticateToken");

const user_controller = require("../controllers/userController");
const squeal_controller = require("../controllers/squealController");
const mod_controller = require('../controllers/ModController')




router.post("/register", user_controller.user_regist_post);
router.post("/dbtest", user_controller.dbtest);
router.post("/login", user_controller.user_login_post);
router.get("/user_detail", authenticateToken, user_controller.user_detail);
router.get("/get_all_users", mod_controller.user_list);
router.post("/squeal_post", authenticateToken, squeal_controller.new_squeal);

router.get('/allSqueals',mod_controller.squeal_all_get)
router.get('/allChannel',mod_controller.channel_all_get)

router.put('/updateUser',mod_controller.user_update_put)
router.put('/updateSqueal',mod_controller.squeal_update_put)
module.exports = router;
