import express from 'express';
import { verifyToken, requireAdmin } from '../middlewares/authMiddleware.js';
import {
  getDashboardStats,
  getSystemStatus,
  getAdminWasteItems,
  createWasteItem,
  updateWasteItem,
  deleteWasteItem,
  getAdminDropPoints,
  createDropPoint,
  updateDropPoint,
  deleteDropPoint,
  getAdminQuizzes,
  createQuiz,
  deleteQuiz,
  getScanLogs,
  deleteScanLog,
  getAllUsers,
  updateUserRole,
  adjustUserPoints,
  getCalculatorSettings,
  updateCalculatorSettings
} from '../controllers/adminController.js';

const router = express.Router();

// Semua rute admin wajib menyertakan token autentikasi yang valid DAN role 'admin'
router.use(verifyToken, requireAdmin);

// 1. Dashboard & Sistem
router.get('/dashboard/stats', getDashboardStats);
router.get('/system/status', getSystemStatus);

// 2. Ensiklopedia Sampah CRUD
router.get('/waste', getAdminWasteItems);
router.post('/waste', createWasteItem);
router.put('/waste/:id', updateWasteItem);
router.delete('/waste/:id', deleteWasteItem);

// 3. Bank Sampah / Drop Points CRUD
router.get('/drop-points', getAdminDropPoints);
router.post('/drop-points', createDropPoint);
router.put('/drop-points/:id', updateDropPoint);
router.delete('/drop-points/:id', deleteDropPoint);

// 4. Kuis & Soal CRUD
router.get('/quizzes', getAdminQuizzes);
router.post('/quizzes', createQuiz);
router.delete('/quizzes/:id', deleteQuiz);

// 5. Monitoring Scan AI
router.get('/scans', getScanLogs);
router.delete('/scans/:id', deleteScanLog);

// 6. Manajemen Pengguna
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.post('/users/:id/adjust-points', adjustUserPoints);

// 7. Pengaturan Kalkulator & Kode Bonus
router.get('/calculator-settings', getCalculatorSettings);
router.put('/calculator-settings', updateCalculatorSettings);

export default router;
