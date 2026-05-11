const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const storeRoutes = require("./routes/storeRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

// connect database
connectDB();

// middleware
app.use(express.json());

// CORS
app.use(cors());

// routes
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Hello SaaS 🚀");
});

// server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});