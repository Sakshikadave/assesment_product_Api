const express = require("express");
const router = new express.Router();
const connection = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const verifyToken = require("../middlware/fetchuser");
const { saveproducts } = require("../middlware/fileuploads");
const path = require("path");
const xlsx = require("xlsx");
const formidable = require("formidable");
const fileUpload = require("express-fileupload");
router.use(fileUpload());
const uploadDirectory = path.join(__dirname, "../public/uploads");

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

//excel
router.post("/addexcelproducts/excel", (req, res) => {
  if (!req.files || !req.files.excelFile) {
    return res.status(400).json({ error: "Excel file not provided" });
  }

  const excelFile = req.files.excelFile;
  const uploadPath = path.join(uploadDirectory, excelFile.name);

  excelFile.mv(uploadPath, async (err) => {
    if (err) {
      console.error("Error saving Excel file: ", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    try {
      const workbook = xlsx.readFile(uploadPath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const excelData = xlsx.utils.sheet_to_json(sheet);

      if (excelData.length === 0) {
        return res.status(400).json({ error: "Empty Excel file" });
      }

      connection.getConnection((err, connection) => {
        if (err) {
          console.error("Error getting connection: ", err);
          return res.status(500).json({ error: "Database connection error" });
        }

        const insertedProducts = [];

        const promises = excelData.map((row) => {
          return new Promise((resolve, reject) => {
            connection.execute(
              "INSERT INTO products (productname, quantity, price, description, category, category_uid, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
              [
                row.productname || null,
                row.quantity || 0,
                row.price || 0.0,
                row.description || null,
                row.category || null,
                row.category_uid || null,
                row.image || "",
              ],
              (err, results) => {
                if (err) {
                  console.error("Error executing query: ", err);
                  reject(err);
                } else {
                  insertedProducts.push({
                    id: results.insertId,
                    productname: row.productname,
                    quantity: row.quantity,
                    price: row.price,
                    description: row.description,
                    category: row.category,
                    category_uid: row.category_uid,
                    image: row.image || "",
                  });
                  resolve();
                }
              }
            );
          });
        });

        Promise.all(promises)
          .then(() => {
            connection.release();
            res.status(200).json({
              message: "Products added from Excel file",
              data: insertedProducts,
            });
          })
          .catch((error) => {
            connection.release();
            console.error("Error inserting data:", error);
            res.status(500).json({ error: "Failed to insert Product data" });
          });
      });
    } catch (error) {
      console.error("Error reading Excel file: ", error);
      return res.status(500).json({ error: "Error reading Excel file" });
    }
  });
});
//GET all productss
router.get("/getallproduct", (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const query = "SELECT * FROM products LIMIT ? OFFSET ?";
  connection.query(
    query,
    [parseInt(limit), parseInt(offset)],
    (err, results) => {
      if (err) {
        console.error("Error fetching product:", err);
        return res.status(500).send("Internal server error");
      }

      // Fetch total count for pagination
      connection.query(
        "SELECT COUNT(*) AS totalCount FROM products",
        (countErr, countResult) => {
          if (countErr) {
            console.error("Error fetching total count of product:", countErr);
            return res.status(500).send("Internal server error");
          }

          const totalCount = countResult[0].totalCount;
          const totalPages = Math.ceil(totalCount / limit);

          res.status(200).json({
            products: results,
            totalPages,
            currentPage: parseInt(page),
            totalCount,
          });
        }
      );
    }
  );
});

// GET a single products by ID
router.get("/getproducts/:id", (req, res) => {
  const productsId = req.params.id;

  try {
    connection.query(
      "SELECT * FROM products WHERE id = ?",
      [productsId],
      (err, result) => {
        if (err) {
          console.log("Error inserting into the database:", err);
          res.status(500).json({ status: 500, error: "Internal Server Error" });
        } else {
          res.status(201).json({ status: 201, result });
        }
      }
    );
  } catch (error) {
    console.error("Caught an error:", error.message);
    res.status(500).json({ status: 500, error: "Internal Server Error" });
  }
});

// DELETE a products by ID
router.delete("/deleteproducts/:id", verifyToken, (req, res) => {
  const productsId = req.params.id;

  try {
    connection.query(
      "DELETE FROM products WHERE id = ?",
      [productsId],
      (err, result) => {
        if (err) {
          console.log("Error inserting into the database:", err);
          res.status(500).json({ status: 500, error: "Internal Server Error" });
        } else {
          res
            .status(201)
            .json({ status: 201, message: "deleted successfully" });
        }
      }
    );
  } catch (error) {
    console.error("Caught an error:", error.message);
    res.status(500).json({ status: 500, error: "Internal Server Error" });
  }
});

//update
router.put("/updateproducts/:id", verifyToken, (req, res) => {
  saveproducts(req, res, (err) => {
    if (err) {
      console.error("Image upload error:", err.message);
      return res.status(400).json({ error: err.message });
    }

    const {
      productname,
      quantity,
      price,
      description,
      category,
      category_uid,
    } = req.body;
    const productsId = req.params.id;

    const url = req.protocol + "://" + req.get("host");
    const imageUrl = url + "/uploads/" + req.file.filename;

    connection.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting connection: ", err);
        // return res.status(500).json({ error: "Internal Server Error" });
      }

      connection.execute(
        "UPDATE products SET productname=?, quantity=?,price=?,description=?, category=?, category_uid=?,image=? WHERE id=?",
        [
          productname,
          quantity,
          price,
          description,
          category,
          category_uid,
          url + "/uploads/" + req.file.filename,
          productsId,
        ],
        (err, results) => {
          connection.release();

          if (err) {
            console.error("Error executing query: ", err);
            // return res.status(500).json({ error: "Internal Server Error" });
          }

          if (results.affectedRows === 0) {
            return res.status(404).json({ error: "products not found" });
          }

          // Send a success response
          res.status(200).json({
            status: "success",
            message: "products updated successfully",
            data: {
              id: productsId,
              productname,
              quantity,
              price,
              description,
              category,
              category_uid,
              image: url + "/uploads/" + req.file.filename,
            },
          });
        }
      );
    });
  });
});

///admfilter?filterByDate=3months
router.get("/admfilter", (req, res) => {
  const filterByDate = req.query.filterByDate || "";

  let dateRange;
  switch (filterByDate) {
    case "month":
      dateRange = new Date(new Date().setMonth(new Date().getMonth() - 1));
      break;
    case "3months":
      dateRange = new Date(new Date().setMonth(new Date().getMonth() - 3));
      break;
    case "6months":
      dateRange = new Date(new Date().setMonth(new Date().getMonth() - 6));
      break;
    case "2days":
      dateRange = new Date(new Date().setDate(new Date().getDate() - 2));
      break;
    default:
      dateRange = null;
      break;
  }

  let query;
  let queryParams;
  if (dateRange) {
    query = "SELECT * FROM products WHERE created_at >= ?";
    queryParams = [dateRange];
  }

  connection.query(query, queryParams, (err, productsRows) => {
    if (err) {
      console.error("Error fetching products:", err);
      // return res.status(500).json({ error: "Internal Server Error" });
    }

    res.status(200).send(productsRows);
  });
});

// example:  searchproducts?search=developer
router.get("/searchproducts", verifyToken, (req, res) => {
  const { search } = req.query;

  const query =
    "SELECT * FROM products WHERE productname LIKE ? OR price LIKE ? OR id LIKE ?";

  conn.query(
    query,
    ["%" + search + "%", "%" + search + "%", "%" + search + "%"],
    (err, results) => {
      if (err) {
        console.error("Error searching products:", err);
        return res.status(500).json({
          status: 500,
          error: "Internal Server Error",
          message: err.message,
        });
      }

      res.status(200).send(results);
    }
  );
});
module.exports = router;
