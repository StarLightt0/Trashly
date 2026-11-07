import express from 'express';
import { getDashboard, updateProfile } from '../controllers/userController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', verifyToken, getDashboard);
router.put('/profile', verifyToken, updateProfile);

export default router;
