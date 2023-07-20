var express = require('express');
var router = express.Router();
const router_handler = require('../router_Handler/users')

/* GET users listing. */
router.get('/getUser',router_handler.getUser)
router.get('/test',router_handler.test)
router.get('/getSqueal',router_handler.getSqueal)
// router.get('popularityCheck',router_handler.popularityCheck)

// POST users listing
router.post('/login',router_handler.login)
router.post('/regUser',router_handler.regUser)
router.post('/resetpsw',router_handler.resetpsw)
router.post('/squeal',router_handler.squeal)

// PUT users listing

module.exports = router;
