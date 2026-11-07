import express from 'express';
import { getQuizzes, getQuizDetail, submitQuiz, getLeaderboard } from '../controllers/quizController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/', optionalAuth, getQuizzes);
router.get('/:identifier', optionalAuth, getQuizDetail);
router.post('/:identifier/submit', optionalAuth, submitQuiz);

export default router;
