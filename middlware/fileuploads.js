const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { maxImageSize, maxDocumentSize } = require("../config"); // Typo in 'confing' should be 'config'
const path = require("path");
const fs = require("fs");
const createUploadsDir = () => {
  const uploadDir = path.join(__dirname, "../public/uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = createUploadsDir();
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName = `product-${uuidv4()}-${Date.now()}${fileExt.toLowerCase()}`;
    cb(null, fileName);
  },
});

const allowedImageMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

const fileFilter = (req, file, cb) => {
  if (allowedImageMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file format"), false);
  }
};

const saveproducts = multer({
  storage: productStorage,
  limits: { fileSize: maxImageSize },
  fileFilter: fileFilter,
}).fields([{ name: "image", maxCount: 1 }]);

module.exports = {
  saveproducts,
};
