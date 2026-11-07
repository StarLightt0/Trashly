import express from 'express';
import { getDropPoints } from '../controllers/dropPointController.js';

const router = express.Router();

router.get('/', getDropPoints);

export default router;

