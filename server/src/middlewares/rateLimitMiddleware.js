import rateLimit from 'express-rate-limit';

export const scanLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 10, // 10 request per menit per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan scan AI. Silakan tunggu 1 menit sebelum mencoba lagi.'
  }
});

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 20, // 20 request per menit per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan chat. Silakan tunggu beberapa saat lagi.'
  }
});
