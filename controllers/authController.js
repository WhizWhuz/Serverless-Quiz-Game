const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
const { debugError } = require("../utils/logger");

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.userId, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "2d" }
  );
};

// POST /signup
exports.signup = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    // 🔎 Check if username already exists using a scan
    const existingUsers = await db
      .scan({
        TableName: process.env.USERS_TABLE,
        FilterExpression: "username = :u",
        ExpressionAttributeValues: { ":u": username },
      })
      .promise();

    if (existingUsers.Items.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      userId: uuidv4(),
      username,
      passwordHash: hashedPassword,
    };

    await db
      .put({
        TableName: process.env.USERS_TABLE,
        Item: newUser,
      })
      .promise();

    const token = generateToken(newUser);

    res.status(201).json({
      message: "User created",
      token,
      user: { userId: newUser.userId, username: newUser.username },
    });
  } catch (err) {
    debugError("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 🔎 Find user by username (scan since username is not a key)
    const result = await db
      .scan({
        TableName: process.env.USERS_TABLE,
        FilterExpression: "username = :u",
        ExpressionAttributeValues: { ":u": username },
      })
      .promise();

    const user = result.Items[0];
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: { userId: user.userId, username: user.username },
    });
  } catch (err) {
    debugError("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

