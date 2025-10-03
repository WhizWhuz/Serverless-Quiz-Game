const jwt = require("jsonwebtoken");
const db = require("../config/db");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await db
      .get({
        TableName: process.env.USERS_TABLE,
        Key: { userId: decoded.userId },
      })
      .promise();

    const user = result.Item;

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = {
      id: user.userId,
      username: user.username,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};
