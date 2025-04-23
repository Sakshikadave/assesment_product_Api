const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  console.log("Request headers:", req.headers);
  console.log("Received Authorization header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Session has expired, please re-login." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Session has expired, please re-login." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);

    req.userId = decoded.id;
    console.log("Token verified successfully. User ID:", decoded.id);

    next();
  } catch (error) {
    console.error("Error verifying token:", error.message);
    return res.status(401).json({
      message:
        "Please login again. Your session has expired. Logout and log in again.",
    });
  }
};

module.exports = verifyToken;
