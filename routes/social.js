const express = require("express");
const router = express.Router();

const user_controller = require("../controllers/userController");

router.post("/create", user_controller.user_create_post);
router.post("/dbtest", user_controller.dbtest);

router.get("/all_users", user_controller.user_list);

module.exports = router;
