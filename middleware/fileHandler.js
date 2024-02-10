const multer = require('multer');
const {join} = require("path");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = ''
        if (req.path === '/post_avatar'){
            uploadPath = join(path.resolve(__dirname, '..'), 'public/avatars')
        } else {
            uploadPath = join(path.resolve(__dirname, '..'), 'public/images')
        }
        cb(null, uploadPath); // 设置存储目录
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // 设置文件名
    }
});


const upload = multer({ storage: storage });

module.exports = upload ;