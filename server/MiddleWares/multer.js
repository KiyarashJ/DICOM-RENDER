const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const Formats = ['dcm', 'DCM'];

exports.UploadFile = (destination) => {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, destination); // فقط uploads
        },
        filename: function (req, file, cb) {
            const fileName = Math.floor(Math.random() * 10000000000);
            const fileExt = path.extname(file.originalname).toLowerCase();
            cb(null, `${fileName}-${uuidv4()}${fileExt}`);
        }
    });

    const fileCheck = multer({
        fileFilter: function (req, file, cb) {
            const x = file.originalname.lastIndexOf(".");
            const fileExt = file.originalname.slice(x + 1).toLowerCase();
            if (!Formats.includes(fileExt)) {
                console.log(`file Format: ${fileExt}`);
                return cb(null, false);
            }
            cb(null, true);
        },
        limits: { fileSize: 10 ** 10 },
        storage
    });

    return fileCheck.array('files');
};





