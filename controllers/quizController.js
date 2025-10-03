const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

// POST - Create Quiz
exports.createQuiz = async (req, res) => {
  const { title } = req.body;

  if (!title)
    return res.status(400).json({ message: "Quiz title is required!" });

  const quizId = uuidv4();
  const newQuiz = {
    quizId,
    title,
    creatorId: req.user.id,
    createdAt: new Date().toISOString(),
  };

  try {
    await db
      .put({
        TableName: process.env.QUIZZES_TABLE,
        Item: newQuiz,
      })
      .promise();

    res.status(201).json({ message: "Quiz created", quiz: newQuiz });
  } catch (err) {
    console.error("Create quiz error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST - Add Question
exports.addQuestion = async (req, res) => {
  const { quizId } = req.params;
  const { question, answer, lat, long } = req.body;

  if (!question || !answer) {
    return res
      .status(400)
      .json({ message: "Question and answer are required!" });
  }

  const questionId = uuidv4();
  const newQuestion = {
    questionId,
    quizId,
    question,
    answer,
    coordinates: { lat, long },
  };

  try {
    const quiz = await db
      .get({
        TableName: process.env.QUIZZES_TABLE,
        Key: { quizId },
      })
      .promise();

    if (!quiz.Item) {
      return res.status(404).json({ message: "Quiz not found!" });
    }

    if (quiz.Item.creatorId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await db
      .put({
        TableName: process.env.QUESTIONS_TABLE,
        Item: newQuestion,
      })
      .promise();

    res.status(201).json({ message: "Question added", question: newQuestion });
  } catch (err) {
    console.error("Add question error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE - Remove Quiz
exports.deleteQuiz = async (req, res) => {
  const { quizId } = req.params;

  try {
    const quiz = await db
      .get({
        TableName: process.env.QUIZZES_TABLE,
        Key: { quizId },
      })
      .promise();

    if (!quiz.Item) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (quiz.Item.creatorId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete" });
    }

    await db
      .delete({
        TableName: process.env.QUIZZES_TABLE,
        Key: { quizId },
      })
      .promise();

    res.json({ message: "Quiz deleted" });
  } catch (err) {
    console.error("Delete quiz error:", err);
    debugError(500).json({ message: "Server error" });
  }
};

// GET - All Quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    const result = await db
      .scan({
        TableName: process.env.QUIZZES_TABLE,
      })
      .promise();

    res.json({ quizzes: result.Items || [] });
  } catch (err) {
    console.error("Get quizzes error:", err);
    debugError(500).json({ message: "Server error" });
  }
};

// GET - One Quiz + its Questions
exports.getOneQuiz = async (req, res) => {
  const { quizId } = req.params;

  try {
    const quiz = await db
      .get({
        TableName: process.env.QUIZZES_TABLE,
        Key: { quizId },
      })
      .promise();

    if (!quiz.Item) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const questions = await db
      .scan({
        TableName: process.env.QUESTIONS_TABLE,
        FilterExpression: "quizId = :quizId",
        ExpressionAttributeValues: { ":quizId": quizId },
      })
      .promise();

    res.json({
      quiz: quiz.Item,
      questions: questions.Items || [],
    });
  } catch (err) {
    debugError("Get one quiz error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
