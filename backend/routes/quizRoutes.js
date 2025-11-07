const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router.get('/', quizController.getFullStructure);
router.get('/quiz/:id', quizController.getStructuredQuizById);
router.post('/add', quizController.addQuiz);
router.delete('/del/:id', quizController.deleteQuizById);
router.post('/add-quest/:quizId/questions', quizController.addQuestionToQuiz);
router.post('/add-result', quizController.addResult);
module.exports = router;