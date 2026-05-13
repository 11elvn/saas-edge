const express = require("express");
const router = express.Router();

const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const auth = require("../middleware/auth");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required ❌",
      });
    }

    // duplicate email
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists ❌",
      });
    }

    // hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // create user
    const user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      message: "User registered ✅",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error ❌",
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required ❌",
      });
    }

    // find user
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found ❌",
      });
    }

    // compare password
    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        message: "Wrong password ❌",
      });
    }

    // generate token
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login successful ✅",
      token,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error ❌",
    });
  }
});

// PROFILE
router.get("/profile", auth, async (req, res) => {
  try {
    const user =
      await User.findById(
        req.user.id
      ).select("-password");

    res.status(200).json(user);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error ❌",
    });
  }
});

module.exports = router;