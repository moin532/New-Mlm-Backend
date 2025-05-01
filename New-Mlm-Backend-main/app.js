const express = require("express");
const bodyParser = require("body-parser");
const env = require("dotenv");
const cors = require("cors");
// const fileUpload = require("express-fileupload");
const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
// app.use(fileUpload());

env.config({ path: "./config/config.env" });

const userRoute = require("./routes/userRoute");
const prdRoute = require("./routes/productsRoute");
const profileRoute = require("./controller/ProfileController"); // Check if this path is correct, might be routes/ProfileRoute
const adminRoute = require("./routes/adminRoute"); // Import the new admin route

app.use("/api/v1/", userRoute);
app.use("/api/v1/", prdRoute);
app.use("/api/v1/", profileRoute);
app.use("/api/v1/", adminRoute); // Use the new admin route
app.use("/uploads", express.static("uploads"));

module.exports = app;
