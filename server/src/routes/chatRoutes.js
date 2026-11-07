import express from 'express';
import { chat } from '../controllers/chatController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';
import { chatLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

router.post('/', chatLimiter, optionalAuth, chat);

export default router;
