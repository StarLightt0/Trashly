import express from 'express';
import { getCategories, getAllWaste, getWasteDetail, getStats } from '../controllers/wasteController.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/stats', getStats);
router.get('/', getAllWaste);
router.get('/:identifier', getWasteDetail);

export default router;
