const express = require("express");
const router = new express.Router();
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const verifyToken = require("../middlware/fetchuser");

router.post("/addcategories", (req, res) => {
  const { name } = req.body;
  const uniqueId = uuidv4();
  pool.query(
    "INSERT INTO categories (name, category_uid) VALUES (?, ?)",
    [name, uniqueId],
    (err) => {
      if (err) return res.status(500).send(err);
      res.status(200).json({ message: "Category created", success: true });
    }
  );
});

router.get("/getallcategories", (req, res) => {
  try {
    pool.query("SELECT * FROM categories", (err, Result) => {
      if (err) {
        console.error("Error querying database: " + err.stack);
        return res
          .status(500)
          .json({ status: "error", error: "Internal Server Error" });
      } else {
        res.status(201).send({ message: "success", Result });
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(404).send("internal server error");
  }
});

router.get("/getacategory/:id", (req, res) => {
  const id = req.params.id;
  try {
    pool.query("SELECT * FROM categories WHERE id=?", id, (err, Result) => {
      if (err) {
        console.error("Error querying database: " + err.stack);
        return res
          .status(500)
          .json({ status: "error", error: "Internal Server Error" });
      } else {
        res.status(201).send({ message: "success", Result });
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(404).send("internal server error");
  }
});

router.delete("/delete/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  pool.query("DELETE FROM categories WHERE id = ?", id, (err, result) => {
    if (err) {
      console.error(err);
      res.status(422).send("Error deleting user");
    } else {
      res.status(201).send({ message: "Category Delete Successfully", result });
    }
  });
});

module.exports = router;
