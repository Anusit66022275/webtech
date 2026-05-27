const multer = require('multer');
const path   = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น (jpeg, png, gif, webp)'));
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
