import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool, isDbConnected, inMemoryStore } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'trashly_super_secret_jwt_key_2026_himtec_hackathon';

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password wajib diisi!'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal terdiri dari 6 karakter!'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if connected to MySQL
    if (isDbConnected()) {
      const pool = getPool();
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, role, points, avatar) VALUES (?, ?, ?, ?, ?, ?)',
        [name.trim(), normalizedEmail, hashedPassword, 'user', 50, defaultAvatar]
      );

      const userId = result.insertId;
      const token = jwt.sign(
        { id: userId, email: normalizedEmail, role: 'user' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Registrasi berhasil! Selamat datang di Trashly.',
        token,
        user: {
          id: userId,
          name: name.trim(),
          email: normalizedEmail,
          role: 'user',
          points: 50, // Welcome bonus
          avatar: defaultAvatar
        }
      });
    } else {
      // In-Memory Fallback
      const existing = inMemoryStore.users.find(u => u.email === normalizedEmail);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
      const newUser = {
        id: inMemoryStore.users.length + 1,
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'user',
        points: 50,
        avatar: defaultAvatar,
        created_at: new Date()
      };

      inMemoryStore.users.push(newUser);

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Registrasi berhasil (Mode In-Memory)! Selamat datang di Trashly.',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          points: newUser.points,
          avatar: newUser.avatar
        }
      });
    }
  } catch (error) {
    console.error('Error saat register:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat registrasi.'
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi!'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = null;

    if (isDbConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
        if (rows && rows.length > 0) {
          user = rows[0];
        }
      } catch (dbErr) {
        console.warn('DB error di login, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    if (!user) {
      user = inMemoryStore.users.find(u => u.email === normalizedEmail);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password yang Anda masukkan salah.'
        });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password yang Anda masukkan salah.'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login berhasil! Selamat datang kembali.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Error saat login:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat login.'
    });
  }
}

export async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    if (isDbConnected()) {
      const pool = getPool();
      const [rows] = await pool.query(
        'SELECT id, name, email, role, points, avatar, created_at FROM users WHERE id = ?',
        [userId]
      );
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pengguna tidak ditemukan.'
        });
      }
      return res.json({ success: true, user: rows[0] });
    } else {
      const user = inMemoryStore.users.find(u => String(u.id) === String(userId) || (req.user?.email && u.email === req.user.email));
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Pengguna tidak ditemukan.'
        });
      }
      const { password, ...safeUser } = user;
      return res.json({ success: true, user: safeUser });
    }
  } catch (error) {
    console.error('Error saat getProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data profil.'
    });
  }
}
