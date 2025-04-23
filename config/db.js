const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "product_api",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});

// Testing the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database: ", err);
  } else {
    console.log("Connected to the database");
    connection.release();
  }
});

module.exports = pool;
