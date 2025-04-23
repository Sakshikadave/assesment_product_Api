require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const morgan = require("morgan");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("public", express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

//middlwares

//test
app.get("/", (req, res) => {
  res.send("Working Properly");
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`App is listening on the port no ${port}`);
});
