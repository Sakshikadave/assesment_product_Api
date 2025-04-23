const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const conn = require("../config/db");

const fetchuser = (req, res, next) => {
  const token = req.get("Authorization") || req.cookies.Authorization;
  if (!token) {
    return res.status(401).json({ error: "Invalid token, please login again" });
  }

  jwt.verify(token, JWT_SECRET, (error, data) => {
    if (error) {
      if (error.name === "TokenExpiredError") {
        res.clearCookie("Authorization");
        return res.status(419).json({
          error: "Your Login Session has expired, please login again",
        });
      }

      console.log("Error with token:", error.message);

      res.clearCookie("Authorization");
      return res
        .status(419)
        .json({ error: "Invalid token, please login again" });
    }

    const selectQuery = "SELECT * FROM users WHERE id = ?";
    conn.query(selectQuery, [data.userId], (err, rows) => {
      if (err) {
        console.error("Error querying database:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (rows.length === 0) {
        res.clearCookie("Authorization");
        return res.status(404).json({ error: "user not found" });
      }

      req.user = {
        userName: rows[0].fullname,
        role: rows[0].role,
        ...rows[0],
      };
      req.userId = data.userId;

      next();
    });
  });
};

module.exports = { fetchuser };
