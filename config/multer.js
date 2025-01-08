const multer = require("multer");

const cloudinary = require("./cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "fullstack-blog-project",
        allowedFormats: ["jpg", "png", "jpeg"],
    },
});

const upload = multer({ storage });

module.exports = upload;