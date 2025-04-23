const express = require("express");
const router = new express.Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const JWT_SECRET = process.env.JWT_SECRET;
const {
  generateToken,
  generateRefreshToken,
} = require("../middlware/refreshToken");
const { fetchuser } = require("../middlware/fetchuser");

const emailValidator = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Function of hash password
const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    throw error;
  }
};

router.post("/register", async (req, res) => {
  try {
    const { fullname, mobile, email, password } = req.body;

    if (!emailValidator(email)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address." });
    }

    const checkMobileQuery = `SELECT id FROM users WHERE mobile = ?`;
    const [existingUsers] = await pool
      .promise()
      .query(checkMobileQuery, [mobile]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Mobile already registered." });
    }

    const hashedPassword = await hashPassword(password);

    const insertQuery = `
        INSERT INTO users (fullname, mobile, email, password)
        VALUES (?, ?, ?, ?)`;
    const insertValues = [fullname, mobile, email, hashedPassword];
    const [insertResult] = await pool
      .promise()
      .query(insertQuery, insertValues);
    const insertedId = insertResult.insertId;

    const selectQuery = `SELECT id, fullname, mobile, email FROM users WHERE id = ?`;
    const [selectResults] = await pool
      .promise()
      .query(selectQuery, [insertedId]);
    const userData = selectResults[0];

    const token = jwt.sign({ userId: insertedId }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "Registration successful",
      userData,
      token,
    });

    console.log(`User registered: ${email}`);
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/userprofile", fetchuser, (req, res) => {
  const authenticateduserId = req.userId;

  pool.query(
    "SELECT * FROM users WHERE id = ?",
    [authenticateduserId],
    (err, userRows) => {
      if (err) {
        console.error("Error fetching user profile:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (userRows.length === 0) {
        return res.json({ error: "user not found." });
      }

      const user = userRows[0];
      const profile = {
        fullname: user.fullname,
        mobile: user.mobile,
        email: user.email,
      };

      res.send(profile);
    }
  );
});

router.get("/getallusers", (req, res) => {
  try {
    pool.query("SELECT * FROM user", (err, Result) => {
      if (err) {
        console.error("Error querying database: " + err.stack);
        return res
          .status(500)
          .json({ status: "error", error: "Internal Server Error" });
      } else {
        // Log user data
        // logger.logToFile("users are Fetch: ", JSON.stringify(Result));
        res.status(201).send({ message: "success", Result });
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(404).send("internal server error");
  }
});

router.delete("/delete/:id", fetchuser, (req, res) => {
  const { id } = req.params;
  pool.query("DELETE FROM user WHERE id = ?", id, (err, result) => {
    if (err) {
      console.error(err);
      res.status(422).send("Error deleting user");
    } else {
      res.status(201).send({ message: "user Delete Successfully", result });
    }
  });
});

module.exports = router;
