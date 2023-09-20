const express = require("express");
const router = express.Router();
const {authenticateToken} = require("../router_Handler/authenticateToken");

const user_controller = require("../controllers/userController");

router.post("/create", user_controller.user_create_post);
router.post("/dbtest", user_controller.dbtest);
router.post("/login", user_controller.user_login_post);
router.get("/user_detail", authenticateToken, user_controller.user_detail);
router.get("/get_all_users", user_controller.user_list);

module.exports = router;
