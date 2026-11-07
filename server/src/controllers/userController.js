import { getPool, isDbConnected, inMemoryStore } from '../config/db.js';

export async function getDashboard(req, res) {
  try {
    const userId = req.user.id;
    let user = null;
    let attempts = [];

    if (isDbConnected()) {
      const pool = getPool();
      const [userRows] = await pool.query(
        'SELECT id, name, email, points, avatar, role, created_at FROM users WHERE id = ?',
        [userId]
      );
      if (userRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      }
      user = userRows[0];

      const [attemptRows] = await pool.query(`
        SELECT 
          qa.*,
          q.title as quiz_title,
          q.slug as quiz_slug,
          q.badge_name
        FROM quiz_attempts qa
        JOIN quizzes q ON qa.quiz_id = q.id
        WHERE qa.user_id = ?
        ORDER BY qa.created_at DESC
        LIMIT 10
      `, [userId]);
      attempts = attemptRows;
    } else {
      const u = inMemoryStore.users.find(usr => String(usr.id) === String(userId) || (req.user?.email && usr.email === req.user.email));
      if (!u) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      }
      const { password, ...safeUser } = u;
      user = safeUser;

      attempts = inMemoryStore.quizAttempts
        .filter(a => String(a.user_id) === String(userId))
        .map(a => {
          const q = inMemoryStore.quizzes.find(quiz => quiz.id === a.quiz_id) || {};
          return {
            ...a,
            quiz_title: q.title || 'Kuis Pilah Sampah',
            quiz_slug: q.slug || '',
            badge_name: q.badge_name || 'Eco Badge'
          };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Rank Badge logic
    let rankBadge = {
      level: 1,
      title: 'Pilah Pemula',
      icon: 'Sprout',
      color: '#16a34a',
      nextTitle: 'Sahabat Bumi',
      targetPoints: 100
    };

    if (user.points >= 350) {
      rankBadge = {
        level: 4,
        title: 'Master Daur Ulang 🏆',
        icon: 'Award',
        color: '#d97706',
        nextTitle: 'Peringkat Tertinggi (Maksimal)',
        targetPoints: user.points
      };
    } else if (user.points >= 200) {
      rankBadge = {
        level: 3,
        title: 'Pejuang Sirkular 🌿',
        icon: 'ShieldCheck',
        color: '#2563eb',
        nextTitle: 'Master Daur Ulang',
        targetPoints: 350
      };
    } else if (user.points >= 100) {
      rankBadge = {
        level: 2,
        title: 'Sahabat Bumi 🌱',
        icon: 'Leaf',
        color: '#059669',
        nextTitle: 'Pejuang Sirkular',
        targetPoints: 200
      };
    }

    // Eco impact metrics based on points
    const bottlesSaved = Math.round(user.points * 0.4);
    const co2SavedKg = (user.points * 0.15).toFixed(1);
    const wasteSortedKg = (user.points * 0.25).toFixed(1);

    return res.json({
      success: true,
      data: {
        user,
        rankBadge,
        stats: {
          bottlesSaved,
          co2SavedKg,
          wasteSortedKg,
          totalQuizzesTaken: attempts.length
        },
        recentAttempts: attempts
      }
    });

  } catch (error) {
    console.error('Error saat getDashboard:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data dashboard pengguna.' });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, avatar } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Nama tidak boleh kosong.' });
    }

    if (isDbConnected()) {
      const pool = getPool();
      await pool.query(
        'UPDATE users SET name = ?, avatar = COALESCE(?, avatar) WHERE id = ?',
        [name.trim(), avatar || null, userId]
      );
      const [updated] = await pool.query(
        'SELECT id, name, email, points, avatar, role FROM users WHERE id = ?',
        [userId]
      );
      return res.json({ success: true, message: 'Profil berhasil diperbarui.', user: updated[0] });
    } else {
      const u = inMemoryStore.users.find(usr => String(usr.id) === String(userId) || (req.user?.email && usr.email === req.user.email));
      if (!u) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      }
      u.name = name.trim();
      if (avatar) u.avatar = avatar;
      const { password, ...safeUser } = u;
      return res.json({ success: true, message: 'Profil berhasil diperbarui.', user: safeUser });
    }
  } catch (error) {
    console.error('Error saat updateProfile:', error);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui profil.' });
  }
}
