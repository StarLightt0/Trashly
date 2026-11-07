import express from 'express';
import { 
  getDashboard, 
  updateProfile, 
  claimCalculatorReward,
  getCalculatorStatus 
} from '../controllers/userController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', verifyToken, getDashboard);
router.put('/profile', verifyToken, updateProfile);
router.get('/calculator-status', verifyToken, getCalculatorStatus);
router.post('/calculator-reward', verifyToken, claimCalculatorReward);

export default router;
