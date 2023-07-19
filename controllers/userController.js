const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// create a new user
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({ id: user.id, email: user.email });
  } else {
    res.status(400);
    throw new Error("User info is not valid");
  }

  res.json("User register successfully");
});

// login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }
  const user = await User.findOne({ email });
  const accessToken = jwt.sign(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json(accessToken);
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// current user
const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = {
  createUser,
  loginUser,
  currentUser,
};
