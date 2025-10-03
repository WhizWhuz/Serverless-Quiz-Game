const express = require("express");
const scoreController = require("../controllers/scoreController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/:quizId/score", auth, scoreController.submitScore);

router.get("/:quizId/leaderboard", scoreController.getLeaderboard);

module.exports = router;
