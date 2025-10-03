const express = require("express");
const quizController = require("../controllers/quizController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", quizController.getAllQuizzes);
router.get("/:quizId", quizController.getOneQuiz);

router.use(auth);

router.post("/", quizController.createQuiz);
router.post("/quizId/questions", quizController.addQuestion);
router.post("/:quizId", quizController.deleteQuiz);

module.exports = router;
