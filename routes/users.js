var express = require('express');
var router = express.Router();
const router_handler = require('../router_Handler/users')

/* GET users listing. */


// POST users listing
router.post('/login',router_handler.login)
router.post('/regUser',router_handler.regUser)
router.post('/resetpsw',router_handler.resetpsw)
router.post('/squeal',router_handler.squeal)
module.exports = router;
