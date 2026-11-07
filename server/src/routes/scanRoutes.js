import express from 'express';
import { 
  detectWaste, 
  getSamples, 
  getScanHistory 
} from '../controllers/scanController.js';
import { optionalAuth, verifyToken } from '../middlewares/authMiddleware.js';
import { scanLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

router.get('/samples', getSamples);
router.post('/detect', scanLimiter, optionalAuth, detectWaste);
router.get('/history', verifyToken, getScanHistory);

export default router;
