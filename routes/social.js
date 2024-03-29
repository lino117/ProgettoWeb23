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
const smm_controller = require('../controllers/smmController')
const {user_changePwd_put} = require("../controllers/userController");
const del = require('../controllers/deleteMongoDBdoc')
const schedule = require('node-schedule');
const {renewCredit} = require("../controllers/squealController");


//User
// GET listing
router.get("/user_detail", authenticateToken, user_controller.user_detail);
router.get("/get_all_users", mod_controller.user_list);
router.get("/get_avatar", user_controller.avatar_get);
router.get("/get_SMM_list", authenticateToken, user_controller.SMM_list_get);
router.post('/choose_smm', authenticateToken, upload.none(), user_controller.chooseSMM_request_post)

// POST listing
router.post("/register", user_controller.user_regist_post);
router.post("/dbtest", user_controller.dbtest);
router.post("/login", user_controller.user_login_post);
router.post("/post_avatar", authenticateToken, upload.single('image'), user_controller.avatar_change);
router.post("/removeSMM", authenticateToken, smm_controller.removeSMM);


// PATCH listing
router.patch('/updateUser', mod_controller.user_update_patch)
router.patch('/updateCredit', authenticateToken, user_controller.user_changeCredit_patch);
// PUT listing
router.put("/changePassword", authenticateToken, user_changePwd_put);

//Squeal
// GET listing
router.get('/allSqueals', mod_controller.squeal_all_get);
router.get('/singleSqueal', squeal_controller.single_squeal_get);
router.get('/get_all_squeals', authenticateToken, squeal_controller.get_squeals);
router.get('/get_image', squeal_controller.image_get);
router.get('/get_views', squeal_controller.views_get)
router.get('/channelSqueal_get', mod_controller.channelSqueal_get)
router.get('/reply_get', squeal_controller.reply_get)
router.get('/get_geoSqueals', authenticateToken, squeal_controller.getGeoSqueals)
router.get('/search_squeal', squeal_controller.search_get)
// POST listing
router.post("/squeal_post", authenticateToken, upload.single('image'), squeal_controller.new_squeal);
router.post("/squeal_reply", authenticateToken, upload.none(), squeal_controller.reply_post);

// PATCH listing
router.patch('/updateSqueal', mod_controller.squeal_update_patch)
router.patch('/addSquealChannel', mod_controller.addSquealChannel)
router.patch('/delSquealChannel', mod_controller.delSquealChannel)
router.patch('/subscribeToChannel', authenticateToken, chan_controller.subscribe_patch)
router.patch('/unsubscribeToChannel', authenticateToken, chan_controller.unsubscribe_patch)

router.patch('/likeSqueal', reaction_controller.squeal_like_patch);
router.patch('/dislikeSqueal', reaction_controller.squeal_dislike_patch);

//PUT listing
router.post('/update_view/', squeal_controller.views_post)

//Channel
// GET listing
router.get('/allChannelO', mod_controller.channelOffi_all_get)
router.get('/allChannelP', mod_controller.channelPriv_all_get)
router.get('/channelsUserO', chan_controller.channel_get_user_Official)
router.get('/channelsUserP', authenticateToken, chan_controller.channel_get_user_Private)

router.get('/squealsInAChannel', chan_controller.channel_squeals)

// POST listing
router.post('/createCh', chan_controller.channel_create_post)
// PATCH listing
router.patch('/updateChannel', chan_controller.channel_update_patch)
router.patch('/updateChannelOff', mod_controller.channelOff_update_patch)
router.patch('/blockChannel', chan_controller.channel_block_patch)
// PUT listing, per eliminare un canale viene usato PUT invece che DELETE poiche secondo il mio parere
// quest ultimo viene usato per eliminare una risorsa del lato server invece di una risorsa su database
router.put('/deleteChannel', mod_controller.channelOffi_delete_put)
// SMM controller
router.get('/get_vip_info', authenticateToken, smm_controller.getVIP)
router.get('/monitoringSqueal', smm_controller.monitoring)
router.get('/req_list', authenticateToken, smm_controller.VIP_req_list)
router.get('/get_vipList', authenticateToken, smm_controller.VIP_list_get)

router.post('/change_smm', smm_controller.changePart)
router.post('/acceptReq', authenticateToken, upload.none(), smm_controller.acceptReq)
router.post('/choose_smm',smm_controller.choosePart)
router.post('/change_smm',smm_controller.changePart)
router.post('/acceptReq',smm_controller.acceptReq)

router.get('/get_smm_list',smm_controller.getSMM)


router.get('/deleteMany', del.deletMany)
router.get('/updateMany', del.updateMany)

//rinnovo credito
schedule.scheduleJob('0 0 * * *', async function () {
    await chan_controller.channel_CatPicApi()
    await chan_controller.channel_NasaPicApi()
    await chan_controller.channel_NEWSAPI()
    await chan_controller.deleteOldNews()
    renewCredit('daily')
});
schedule.scheduleJob('0 0 * * 1', function () {
    renewCredit('weekly')
});
schedule.scheduleJob('0 0 1 * *', function () {
    renewCredit('monthly')
});
module.exports = router;
