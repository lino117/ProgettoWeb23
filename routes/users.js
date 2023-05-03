var express = require('express');
var router = express.Router();
const router_handler = require('../router_Handler/users')

/* GET users listing. */
// router.get('/search',router_handler.search)
router.post('/login',router_handler.login)
router.post('/regUser',router_handler.regUser)
router.post('/resetpsw',router_handler.resetpsw)
module.exports = router;
