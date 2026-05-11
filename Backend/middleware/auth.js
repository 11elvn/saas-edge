const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.send("No token ❌");
    }

    const decoded = jwt.verify(token, "SECRET_KEY");

    req.user = decoded;

    next();
  } catch (error) {
    res.send("Invalid token ❌");
  }
};

module.exports = auth;