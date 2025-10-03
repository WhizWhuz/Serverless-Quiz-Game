const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
const { debugError } = require("../utils/logger");

// POST 
exports.submitScore = async (req, res) => {
  const { quizId } = req.params;
  const { score } = req.body;

  if (!score && score !== 0) {
    return res.status(400).json({ message: "Score is required!" });
  }

  const newScore = {
    scoreId: uuidv4(),
    quizId,
    userId: req.user.id,
    username: req.user.username,
    score,
    createdAt: new Date().toISOString(),
  };

  try {
    await db
      .put({
        TableName: process.env.SCORES_TABLE,
        Item: newScore,
      })
      .promise();

    res.status(201).json({ message: "Score saved!", score: newScore });
  } catch (err) {
    debugError("submitScore", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET
exports.getLeaderboard = async (req, res) => {
  const { quizId } = req.params;

  try {
    // For dev: scan instead of query (so no GSI needed)
    const result = await db
      .scan({
        TableName: process.env.SCORES_TABLE,
        FilterExpression: "quizId = :q",
        ExpressionAttributeValues: { ":q": quizId },
      })
      .promise();

    const scores = result.Items || [];

    // sort high to low
    scores.sort((a, b) => b.score - a.score);

    res.json({ leaderboard: scores });
  } catch (err) {
    debugError("getLeaderboard", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
