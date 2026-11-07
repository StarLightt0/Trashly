import bcrypt from 'bcryptjs';
import { getPool, isDbConnected, inMemoryStore } from '../config/db.js';

export async function getDashboard(req, res) {
  try {
    const userId = req.user.id;
    let user = null;
    let attempts = [];

    if (isDbConnected()) {
      try {
        const pool = getPool();
        const [userRows] = await pool.query(
          'SELECT * FROM users WHERE id = ?',
          [userId]
        );
        if (userRows && userRows.length > 0) {
          const { password, ...safeUser } = userRows[0];
          user = safeUser;

          try {
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
            attempts = attemptRows || [];
          } catch (e) {
            attempts = [];
          }
        }
      } catch (dbErr) {
        console.warn('DB error di getDashboard:', dbErr.message);
      }
    }

    if (!user) {
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
    const name = (req.body.name || req.body.username || '').trim();
    const avatar = req.body.avatar;
    const bio = req.body.bio !== undefined ? String(req.body.bio).trim() : undefined;
    const phone = req.body.phone !== undefined ? String(req.body.phone).trim() : undefined;
    const institution = req.body.institution !== undefined ? String(req.body.institution).trim() : undefined;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Username / Nama tidak boleh kosong!' });
    }

    if (name.length < 2) {
      return res.status(400).json({ success: false, message: 'Username / Nama minimal terdiri dari 2 karakter!' });
    }

    // Validate avatar if provided as Data URL / Base64
    if (avatar && typeof avatar === 'string' && avatar.startsWith('data:')) {
      const match = avatar.match(/^data:(image\/(?:png|jpeg|jpg));base64,([\s\S]+)$/i);
      if (!match) {
        return res.status(400).json({
          success: false,
          message: 'Format foto harus berupa PNG atau JPG/JPEG!'
        });
      }

      // Calculate byte size from base64 string
      const base64Data = match[2].replace(/\s/g, '');
      const byteSize = Math.round((base64Data.length * 3) / 4);
      const maxSizeBytes = 2 * 1024 * 1024; // 2 MB

      if (byteSize > maxSizeBytes) {
        return res.status(400).json({
          success: false,
          message: 'Ukuran foto melebihi batas maksimal 2 MB!'
        });
      }
    }

    if (isDbConnected()) {
      const pool = getPool();
      let updateSql = 'UPDATE users SET name = ?';
      const params = [name];

      // Update avatar if provided
      if (avatar !== undefined && avatar !== null) {
        // If avatar is explicit empty string, reset to default bot avatar
        const newAvatar = avatar === '' ? `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}` : avatar;
        updateSql += ', avatar = ?';
        params.push(newAvatar);
      }
      if (bio !== undefined) {
        updateSql += ', bio = ?';
        params.push(bio);
      }
      if (phone !== undefined) {
        updateSql += ', phone = ?';
        params.push(phone);
      }
      if (institution !== undefined) {
        updateSql += ', institution = ?';
        params.push(institution);
      }

      updateSql += ' WHERE id = ?';
      params.push(userId);

      await pool.query(updateSql, params);

      const [updated] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
      if (updated && updated.length > 0) {
        const { password, ...safeUser } = updated[0];
        const userResult = {
          ...safeUser,
          username: safeUser.name
        };
        return res.json({ success: true, message: 'Profil Anda berhasil diperbarui!', user: userResult });
      }
    } else {
      const u = inMemoryStore.users.find(usr => String(usr.id) === String(userId) || (req.user?.email && usr.email === req.user.email));
      if (!u) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      }
      u.name = name;
      if (avatar !== undefined && avatar !== null) {
        u.avatar = avatar === '' ? `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}` : avatar;
      }
      if (bio !== undefined) {
        u.bio = bio;
      }
      if (phone !== undefined) {
        u.phone = phone;
      }
      if (institution !== undefined) {
        u.institution = institution;
      }
      const { password, ...safeUser } = u;
      return res.json({
        success: true,
        message: 'Profil Anda berhasil diperbarui!',
        user: { ...safeUser, username: safeUser.name }
      });
    }
  } catch (error) {
    console.error('Error saat updateProfile:', error);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui profil: ' + error.message });
  }
}

export async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Password lama dan password baru wajib diisi!' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter!' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Konfirmasi password baru tidak cocok!' });
    }

    if (isDbConnected()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      }

      const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Password lama yang Anda masukkan salah!' });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
      return res.json({ success: true, message: 'Password akun berhasil diubah!' });
    } else {
      const u = inMemoryStore.users.find(usr => String(usr.id) === String(userId) || (req.user?.email && usr.email === req.user.email));
      if (!u) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      }

      const isMatch = await bcrypt.compare(oldPassword, u.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Password lama yang Anda masukkan salah!' });
      }

      u.password = await bcrypt.hash(newPassword, 10);
      return res.json({ success: true, message: 'Password akun berhasil diubah!' });
    }
  } catch (error) {
    console.error('Error saat changePassword:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengubah password: ' + error.message });
  }
}

export async function getCalculatorStatus(req, res) {
  try {
    const userId = req.user.id;
    let lastClaim = null;
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    if (isDbConnected()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT last_calculator_claim FROM users WHERE id = ?', [userId]);
      if (rows.length > 0 && rows[0].last_calculator_claim) {
        lastClaim = rows[0].last_calculator_claim;
      }
    } else {
      const u = inMemoryStore.users.find(usr => String(usr.id) === String(userId) || (req.user?.email && usr.email === req.user.email));
      if (u && u.last_calculator_claim) {
        lastClaim = u.last_calculator_claim;
      }
    }

    if (!lastClaim) {
      return res.json({
        success: true,
        canClaim: true,
        daysRemaining: 0,
        hoursRemaining: 0,
        minutesRemaining: 0,
        nextClaimDate: null,
        activeCode: 'TRASHLY-WEEKLY'
      });
    }

    const timePassed = Date.now() - new Date(lastClaim).getTime();
    if (timePassed < ONE_WEEK_MS) {
      const msLeft = ONE_WEEK_MS - timePassed;
      const daysRemaining = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
      const hoursRemaining = Math.ceil(msLeft / (60 * 60 * 1000));
      const minutesRemaining = Math.ceil(msLeft / (60 * 1000));
      const nextClaimDate = new Date(new Date(lastClaim).getTime() + ONE_WEEK_MS).toISOString();

      return res.json({
        success: true,
        canClaim: false,
        daysRemaining,
        hoursRemaining,
        minutesRemaining,
        nextClaimDate,
        lastClaimDate: new Date(lastClaim).toISOString(),
        activeCode: 'TRASHLY-WEEKLY'
      });
    }

    return res.json({
      success: true,
      canClaim: true,
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      nextClaimDate: null,
      activeCode: 'TRASHLY-WEEKLY'
    });

  } catch (error) {
    console.error('Error saat getCalculatorStatus:', error);
    return res.status(500).json({ success: false, message: 'Gagal memeriksa status klaim kalkulator.' });
  }
}

export async function claimCalculatorReward(req, res) {
  try {
    const userId = req.user.id;
    const { code } = req.body || {};
    const rewardPoints = 30;
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    let user = null;

    if (isDbConnected()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT id, points, last_calculator_claim FROM users WHERE id = ?', [userId]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      }
      user = rows[0];

      // Check weekly cooldown (7 days)
      if (user.last_calculator_claim) {
        const timePassed = Date.now() - new Date(user.last_calculator_claim).getTime();
        if (timePassed < ONE_WEEK_MS) {
          const msLeft = ONE_WEEK_MS - timePassed;
          const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
          const hoursLeft = Math.ceil(msLeft / (60 * 60 * 1000));
          const nextDate = new Date(new Date(user.last_calculator_claim).getTime() + ONE_WEEK_MS).toISOString();
          return res.status(400).json({
            success: false,
            message: `Batas klaim kode bonus kalkulator adalah 1 minggu sekali. Anda dapat mengklaim kembali dalam ${daysLeft} hari (${hoursLeft} jam)!`,
            canClaim: false,
            daysRemaining: daysLeft,
            hoursRemaining: hoursLeft,
            nextClaimDate: nextDate
          });
        }
      }

      await pool.query(
        'UPDATE users SET points = points + ?, last_calculator_claim = NOW() WHERE id = ?',
        [rewardPoints, userId]
      );
      const [updated] = await pool.query('SELECT points, last_calculator_claim FROM users WHERE id = ?', [userId]);

      return res.json({
        success: true,
        message: 'Selamat! Kode bonus mingguan +30 Eco-Points berhasil diklaim.',
        pointsEarned: rewardPoints,
        newTotalPoints: updated[0].points,
        canClaim: false,
        daysRemaining: 7,
        hoursRemaining: 168,
        nextClaimDate: new Date(Date.now() + ONE_WEEK_MS).toISOString()
      });

    } else {
      const u = inMemoryStore.users.find(usr => String(usr.id) === String(userId) || (req.user?.email && usr.email === req.user.email));
      if (!u) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      }

      // Check weekly cooldown (7 days)
      if (u.last_calculator_claim) {
        const timePassed = Date.now() - new Date(u.last_calculator_claim).getTime();
        if (timePassed < ONE_WEEK_MS) {
          const msLeft = ONE_WEEK_MS - timePassed;
          const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
          const hoursLeft = Math.ceil(msLeft / (60 * 60 * 1000));
          const nextDate = new Date(new Date(u.last_calculator_claim).getTime() + ONE_WEEK_MS).toISOString();
          return res.status(400).json({
            success: false,
            message: `Batas klaim kode bonus kalkulator adalah 1 minggu sekali. Anda dapat mengklaim kembali dalam ${daysLeft} hari (${hoursLeft} jam)!`,
            canClaim: false,
            daysRemaining: daysLeft,
            hoursRemaining: hoursLeft,
            nextClaimDate: nextDate
          });
        }
      }

      u.points = (u.points || 0) + rewardPoints;
      u.last_calculator_claim = new Date();

      return res.json({
        success: true,
        message: 'Selamat! Kode bonus mingguan +30 Eco-Points berhasil diklaim.',
        pointsEarned: rewardPoints,
        newTotalPoints: u.points,
        canClaim: false,
        daysRemaining: 7,
        hoursRemaining: 168,
        nextClaimDate: new Date(Date.now() + ONE_WEEK_MS).toISOString()
      });
    }

  } catch (error) {
    console.error('Error saat claimCalculatorReward:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengklaim poin kalkulator.' });
  }
}
