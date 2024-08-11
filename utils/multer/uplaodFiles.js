const multer = require('multer');





const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({
    storage: storage
    //limits: { fileSize: 1000000 } // 1MB file size limit
});

module.exports = { upload };