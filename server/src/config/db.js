import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { 
  initialCategories, 
  initialWasteItems, 
  initialQuizzes, 
  initialQuestions,
  initialDropPoints
} from '../seeds/initialData.js';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trashly_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
};

let pool = null;
let isConnected = false;

// Fallback in-memory store in case MySQL service is not yet started in Laragon
export const inMemoryStore = {
  isUsingFallback: false,
  users: [
    {
      id: 99,
      name: "Admin Trashly",
      email: "admin@trashly.id",
      password: "$2a$10$PCUzdZ0Q1LIlEkZ0yqag2./ONRNQ.hjlwuz7GGl07MkPRSi9Q7ucC", // "password123"
      role: "admin",
      points: 9999,
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AdminTrashly",
      bio: "Administrator & Pengelola Sistem Trashly 🌱",
      phone: "081234567899",
      institution: "Trashly Core Team",
      created_at: new Date(Date.now() - 86400000 * 30)
    },
    {
      id: 1,
      name: "Rian Pratama",
      email: "rian@trashly.id",
      password: "$2a$10$PCUzdZ0Q1LIlEkZ0yqag2./ONRNQ.hjlwuz7GGl07MkPRSi9Q7ucC", // "password123"
      role: "user",
      points: 450,
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Rian",
      created_at: new Date(Date.now() - 86400000 * 5)
    },
    {
      id: 2,
      name: "Alya Putri",
      email: "alya@trashly.id",
      password: "$2a$10$PCUzdZ0Q1LIlEkZ0yqag2./ONRNQ.hjlwuz7GGl07MkPRSi9Q7ucC", // "password123"
      role: "user",
      points: 380,
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Alya",
      created_at: new Date(Date.now() - 86400000 * 4)
    },
    {
      id: 3,
      name: "Demo Eco Warrior",
      email: "demo@trashly.id",
      password: "$2a$10$PCUzdZ0Q1LIlEkZ0yqag2./ONRNQ.hjlwuz7GGl07MkPRSi9Q7ucC", // "password123" // "password123"
      role: "user",
      points: 250,
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EcoWarrior",
      bio: "Pecinta lingkungan aktif & siap memilah sampah untuk bumi yang lebih hijau 🌱",
      phone: "081234567890",
      institution: "Universitas Teknologi Bandung",
      created_at: new Date(Date.now() - 86400000 * 3)
    },
    {
      id: 4,
      name: "Budi Santoso",
      email: "budi@trashly.id",
      password: "$2a$10$PCUzdZ0Q1LIlEkZ0yqag2./ONRNQ.hjlwuz7GGl07MkPRSi9Q7ucC", // "password123"
      role: "user",
      points: 180,
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Budi",
      created_at: new Date(Date.now() - 86400000 * 2)
    },
    {
      id: 5,
      name: "Citra Lestari",
      email: "citra@trashly.id",
      password: "$2a$10$PCUzdZ0Q1LIlEkZ0yqag2./ONRNQ.hjlwuz7GGl07MkPRSi9Q7ucC", // "password123"
      role: "user",
      points: 120,
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Citra",
      created_at: new Date(Date.now() - 86400000 * 1)
    }
  ],
  categories: [...initialCategories],
  wasteItems: [...initialWasteItems],
  quizzes: [...initialQuizzes],
  questions: [...initialQuestions],
  dropPoints: [...initialDropPoints],
  quizAttempts: [
    {
      id: 1,
      user_id: 3,
      quiz_id: 1,
      score: 100,
      points_earned: 100,
      correct_answers: 5,
      total_questions: 5,
      created_at: new Date(Date.now() - 3600000 * 4)
    }
  ],
  scans: []
};

export async function initDatabase() {
  try {
    console.log(`📡 Mencoba menghubungkan ke MySQL (${dbConfig.host}:${dbConfig.port})...`);
    
    // 1. Ensure database exists if possible (non-blocking if already exists or permission restricted)
    try {
      const rootConnection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        connectTimeout: 5000
      });
      await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
      await rootConnection.end();
    } catch (createDbErr) {
      // Database might already exist or user lacks root privileges; pool connection will verify.
    }

    // 2. Create the connection pool with database selected & test ping
    pool = mysql.createPool(dbConfig);
    await pool.query('SELECT 1');

    // 3. Create tables if not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        color VARCHAR(50) NOT NULL,
        badge_bg VARCHAR(50) NOT NULL,
        badge_text VARCHAR(50) NOT NULL,
        description TEXT,
        icon VARCHAR(50)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        points INT DEFAULT 0,
        avatar LONGTEXT DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        institution VARCHAR(255) DEFAULT 'Universitas Teknologi Bandung',
        last_calculator_claim TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure avatar column is LONGTEXT for photo storage
    try {
      await pool.query('ALTER TABLE users MODIFY COLUMN avatar LONGTEXT;');
    } catch (e) {
      // Column might already be LONGTEXT or table newly created
    }

    // Ensure last_calculator_claim column exists for 1-week cooldown
    try {
      await pool.query('ALTER TABLE users ADD COLUMN last_calculator_claim TIMESTAMP NULL DEFAULT NULL;');
    } catch (e) {
      // Column might already exist
    }

    // Ensure profile fields (bio, phone, institution) exist
    try {
      await pool.query('ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL;');
    } catch (e) {}

    try {
      await pool.query('ALTER TABLE users ADD COLUMN phone VARCHAR(50) DEFAULT NULL;');
    } catch (e) {}

    try {
      await pool.query('ALTER TABLE users ADD COLUMN institution VARCHAR(255) DEFAULT "Universitas Teknologi Bandung";');
    } catch (e) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS waste_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        image_url TEXT,
        decomposition_time VARCHAR(255),
        is_recyclable TINYINT(1) DEFAULT 1,
        impact_level VARCHAR(100),
        summary TEXT,
        disposal_steps TEXT,
        recycling_potential TEXT,
        danger_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        difficulty VARCHAR(50) DEFAULT 'Mudah',
        duration_minutes INT DEFAULT 5,
        reward_points INT DEFAULT 100,
        icon VARCHAR(50) DEFAULT 'Recycle',
        badge_name VARCHAR(100) DEFAULT 'Master Pemilah'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT PRIMARY KEY,
        quiz_id INT NOT NULL,
        question_text TEXT NOT NULL,
        options JSON NOT NULL,
        correct_answer VARCHAR(255) NOT NULL,
        explanation TEXT,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        quiz_id INT NOT NULL,
        score INT NOT NULL,
        points_earned INT NOT NULL,
        correct_answers INT NOT NULL,
        total_questions INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS drop_points (
        id INT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        accepted_types JSON NOT NULL,
        opening_hours VARCHAR(255),
        contact_phone VARCHAR(50),
        incentive TEXT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        map_link TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS waste_scans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        waste_name VARCHAR(255) NOT NULL,
        category_name VARCHAR(100) NOT NULL,
        confidence INT NOT NULL,
        image_url LONGTEXT NULL,
        points_earned INT DEFAULT 15,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Seed initial categories
    for (const cat of initialCategories) {
      await pool.query(
        `INSERT IGNORE INTO categories (id, name, slug, color, badge_bg, badge_text, description, icon) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [cat.id, cat.name, cat.slug, cat.color, cat.badge_bg, cat.badge_text, cat.description, cat.icon]
      );
    }

    // 5. Seed initial waste items
    for (const item of initialWasteItems) {
      await pool.query(
        `INSERT IGNORE INTO waste_items 
         (id, category_id, name, slug, image_url, decomposition_time, is_recyclable, impact_level, summary, disposal_steps, recycling_potential, danger_notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.category_id,
          item.name,
          item.slug,
          item.image_url,
          item.decomposition_time,
          item.is_recyclable,
          item.impact_level,
          item.summary,
          item.disposal_steps,
          item.recycling_potential,
          item.danger_notes
        ]
      );
    }

    // 6. Seed initial quizzes
    for (const q of initialQuizzes) {
      await pool.query(
        `INSERT IGNORE INTO quizzes (id, title, slug, description, difficulty, duration_minutes, reward_points, icon, badge_name) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [q.id, q.title, q.slug, q.description, q.difficulty, q.duration_minutes, q.reward_points, q.icon, q.badge_name]
      );
    }

    // 7. Seed initial questions
    for (const quest of initialQuestions) {
      await pool.query(
        `INSERT IGNORE INTO questions (id, quiz_id, question_text, options, correct_answer, explanation) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [quest.id, quest.quiz_id, quest.question_text, quest.options, quest.correct_answer, quest.explanation]
      );
    }

    // 8. Replace drop points with the exact 7 requested locations
    await pool.query('DELETE FROM drop_points;');
    for (const dp of initialDropPoints) {
      await pool.query(
        `INSERT INTO drop_points (id, name, city, address, accepted_types, opening_hours, contact_phone, incentive, latitude, longitude, map_link) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [dp.id, dp.name, dp.city, dp.address, dp.accepted_types, dp.opening_hours, dp.contact_phone, dp.incentive, dp.latitude, dp.longitude, dp.map_link]
      );
    }

    // 9. Seed demo users
    for (const u of inMemoryStore.users) {
      await pool.query(
        `INSERT INTO users (id, name, email, password, role, points, avatar, bio, phone, institution) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE role = VALUES(role)`,
        [u.id, u.name, u.email, u.password, u.role, u.points, u.avatar, u.bio || 'Pecinta lingkungan aktif & siap memilah sampah untuk bumi yang lebih hijau 🌱', u.phone || '081234567890', u.institution || 'Universitas Teknologi Bandung']
      );
    }

    isConnected = true;
    inMemoryStore.isUsingFallback = false;
    console.log('✅ Berhasil terhubung ke MySQL dan database trashly_db siap digunakan!');
    return pool;

  } catch (err) {
    console.warn('\n========================================================================');
    console.warn('⚠️  PERINGATAN KONEKSI MYSQL:');
    console.warn(`   Tidak dapat terhubung ke MySQL di ${dbConfig.host}:${dbConfig.port} (${err.code || err.message}).`);
    console.warn('   💡 Pastikan Laragon/XAMPP sudah dinyalakan (klik "Start All").');
    console.warn('   🚀 SERVER TETAP BERJALAN dalam mode In-Memory Fallback agar frontend');
    console.warn('      dan fitur kuis/user tetap dapat diuji 100%!');
    console.warn('========================================================================\n');
    isConnected = false;
    inMemoryStore.isUsingFallback = true;
    return null;
  }
}

export function getPool() {
  return pool;
}

export function isDbConnected() {
  return isConnected;
}
