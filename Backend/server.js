const express = require("express");
const app = express();

const userRoutes = require("./routes/userRoutes");

// middleware مهم باش يقرا JSON
app.use(express.json());

// routes
app.use("/api/users", userRoutes);

// test route عام
app.get("/ping", (req, res) => {
  res.send("PONG 🚀");
});

app.listen(3000, () => {
  console.log("SERVER OK");
});