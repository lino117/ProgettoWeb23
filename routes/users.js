var express = require('express');
var router = express.Router();
const router_handler = require('../routerHandler/users')

/* GET users listing. */
router.get('/', router_handler.get);
router.post('/login',)
router.post('/regUser',router_handler.regUser)

module.exports = router;
