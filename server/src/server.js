import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, isDbConnected } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import wasteRoutes from './routes/wasteRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dropPointRoutes from './routes/dropPointRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*', // Can be restricted to client URL in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Trashly Backend API',
    databaseConnected: isDbConnected(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/user', userRoutes);
app.use('/api/drop-points', dropPointRoutes);

// Root route
app.get('/', (req, res) => {
  res.send({
    message: 'Trashly API Service is Running 🌱',
    documentation: {
      auth: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/auth/me'],
      waste: [
        'GET /api/waste',
        'GET /api/waste/:identifier',
        'GET /api/waste/categories',
        'GET /api/waste/stats'
      ],
      quizzes: [
        'GET /api/quizzes',
        'GET /api/quizzes/:identifier',
        'POST /api/quizzes/:identifier/submit',
        'GET /api/quizzes/leaderboard'
      ],
      user: [
        'GET /api/user/dashboard',
        'PUT /api/user/profile'
      ],
      health: 'GET /api/health'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} tidak ditemukan.`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal pada server.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
async function startServer() {
  await initDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Trashly Server running at http://127.0.0.1:${PORT} (and http://localhost:${PORT})`);
    console.log(`🌿 API Health check: http://127.0.0.1:${PORT}/api/health\n`);
  });
}

startServer();
