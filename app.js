const express = require("express");
const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const scoreRoutes = require("./routes/scoreRoutes");

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/quizzes", quizRoutes);
app.use("/quizzes", scoreRoutes);

app.get("/ping", async (req, res) => {
  try {
    const result = await db
      .scan({
        TableName: process.env.USERS_TABLE,
        Limit: 1,
      })
      .promise();
    res.json({ ok: true, env: process.env.USERS_TABLE, sample: result.Items });
  } catch (err) {
    console.error("Ping error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Quiz Game API is running 🚀" });
});

module.exports = app;
