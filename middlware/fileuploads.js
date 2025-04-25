const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const maxDocumentSize = 10 * 1024 * 1024;

const productStorage = multer.diskStorage({
  filename: (req, file, cb) => {
    const fileName = "-" + file.originalname.toLowerCase().split(" ").join("-");
    cb(null, "product-" + uuidv4() + fileName);
  },
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/");
  },
});

const saveproducts = multer({
  storage: productStorage,
  limits: { fileSize: maxDocumentSize },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return null;
    }
  },
}).single("images");

module.exports = {
  saveproducts,
};
