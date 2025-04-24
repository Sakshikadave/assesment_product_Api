const express = require("express");
const router = new express.Router();
const connection = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const verifyToken = require("../middlware/fetchuser");
const { saveproducts } = require("../middlware/fileuploads");
const XLSX = require("xlsx");

router.post("/addproduct", verifyToken, saveproducts, async (req, res) => {
  try {
    console.log("Uploaded Files:", req.files);
    console.log("Request Body:", req.body);

    const authenticatedUserId = req.userId;

    if (!req.body) {
      return res.status(400).json({ error: "Missing form data" });
    }

    const {
      productname,
      quantity,
      price,
      description,
      category,
      category_uid,
    } = req.body;

    const fileFields = ["image"];
    const url = req.protocol + "://" + req.get("host");

    const filePaths = fileFields.reduce((paths, field) => {
      paths[field] = req.files?.[field]?.[0]
        ? url + "/uploads/" + req.files[field][0].filename
        : null;
      return paths;
    }, {});

    const query = `
        INSERT INTO products (
          user_id,  productname, quantity,price,description,category,category_uid, image
        ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)
      `;

    const values = [
      authenticatedUserId,
      productname,
      quantity,
      price,
      description,
      category,
      category_uid,
      filePaths.image,
    ];

    const [insertResult] = await connection.promise().query(query, values);

    res.status(200).json({
      message: "Product added successfully.",
      data: {
        id: insertResult.insertId,
        ...req.body,
        ...filePaths,
      },
    });
  } catch (err) {
    console.error("Error processing request:", err.sqlMessage || err.message);
    res.status(500).json({
      error: "An error occurred while processing your request.",
    });
  }
});

router.get("/report", verifyToken, (req, res) => {
  connection.query("SELECT * FROM products", (err, results) => {
    if (err) return res.status(500).send(err);
    const ws = XLSX.utils.json_to_sheet(results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=report.xlsx");
    res.send(buffer);
  });
});

module.exports = router;
