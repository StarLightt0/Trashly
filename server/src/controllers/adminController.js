import { getPool, isDbConnected, inMemoryStore } from '../config/db.js';
import { safeParseJson } from '../utils/helpers.js';
import { calculatorSettings } from '../config/calculatorSettings.js';

// ==========================================
// 1. DASHBOARD & SYSTEM STATS
// ==========================================
export async function getDashboardStats(req, res) {
  try {
    if (isDbConnected()) {
      try {
        const pool = getPool();

        // Agregasi metrik utama
        const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
        const [[{ totalWaste }]] = await pool.query('SELECT COUNT(*) as totalWaste FROM waste_items');
        const [[{ totalDropPoints }]] = await pool.query('SELECT COUNT(*) as totalDropPoints FROM drop_points');
        const [[{ totalQuizzes }]] = await pool.query('SELECT COUNT(*) as totalQuizzes FROM quizzes');
        const [[{ totalScans }]] = await pool.query('SELECT COUNT(*) as totalScans FROM waste_scans');
        const [[{ totalPoints }]] = await pool.query('SELECT COALESCE(SUM(points), 0) as totalPoints FROM users');

        // Recent 5 scans
        const [recentScans] = await pool.query(`
          SELECT s.*, u.name as user_name, u.email as user_email
          FROM waste_scans s
          LEFT JOIN users u ON s.user_id = u.id
          ORDER BY s.created_at DESC
          LIMIT 5
        `);

        // Recent 5 users
        const [recentUsers] = await pool.query(`
          SELECT id, name, email, role, points, avatar, created_at
          FROM users
          ORDER BY created_at DESC
          LIMIT 5
        `);

        // Category breakdown
        const [categoryBreakdown] = await pool.query(`
          SELECT c.id, c.name, c.slug, c.color, COUNT(w.id) as item_count
          FROM categories c
          LEFT JOIN waste_items w ON w.category_id = c.id
          GROUP BY c.id, c.name, c.slug, c.color
        `);

        return res.json({
          success: true,
          data: {
            metrics: {
              totalUsers: Number(totalUsers) || 0,
              totalWaste: Number(totalWaste) || 0,
              totalDropPoints: Number(totalDropPoints) || 0,
              totalQuizzes: Number(totalQuizzes) || 0,
              totalScans: Number(totalScans) || 0,
              totalPointsCirculating: Number(totalPoints) || 0
            },
            recentScans,
            recentUsers,
            categoryBreakdown
          }
        });
      } catch (dbErr) {
        console.warn('DB error di getDashboardStats, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    // In-memory Fallback
    const totalPoints = inMemoryStore.users.reduce((sum, u) => sum + (u.points || 0), 0);
    const recentScans = (inMemoryStore.scans || []).slice(-5).reverse();
    const recentUsers = inMemoryStore.users.slice(-5).reverse();

    const categoryBreakdown = inMemoryStore.categories.map(c => {
      const count = inMemoryStore.wasteItems.filter(w => w.category_id === c.id).length;
      return { id: c.id, name: c.name, slug: c.slug, color: c.color, item_count: count };
    });

    return res.json({
      success: true,
      data: {
        metrics: {
          totalUsers: inMemoryStore.users.length,
          totalWaste: inMemoryStore.wasteItems.length,
          totalDropPoints: inMemoryStore.dropPoints.length,
          totalQuizzes: inMemoryStore.quizzes.length,
          totalScans: (inMemoryStore.scans || []).length,
          totalPointsCirculating: totalPoints
        },
        recentScans,
        recentUsers,
        categoryBreakdown
      }
    });
  } catch (error) {
    console.error('Error saat getDashboardStats:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil statistik dashboard.' });
  }
}

export async function getSystemStatus(req, res) {
  try {
    return res.json({
      success: true,
      data: {
        serverTime: new Date().toISOString(),
        databaseConnected: isDbConnected(),
        geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
        nodeEnv: process.env.NODE_ENV || 'development',
        corsOrigin: process.env.CLIENT_URL || 'http://localhost:3000'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengecek status sistem.' });
  }
}

// ==========================================
// 2. ENSIKLOPEDIA SAMPAH CRUD
// ==========================================
export async function getAdminWasteItems(req, res) {
  try {
    const { search, category } = req.query;

    if (isDbConnected()) {
      try {
        const pool = getPool();
        let query = `
          SELECT w.*, c.name as category_name, c.slug as category_slug, c.color as category_color, c.badge_bg, c.badge_text
          FROM waste_items w
          LEFT JOIN categories c ON w.category_id = c.id
          WHERE 1=1
        `;
        const params = [];

        if (search) {
          query += ' AND (w.name LIKE ? OR w.summary LIKE ?)';
          params.push(`%${search}%`, `%${search}%`);
        }
        if (category && category !== 'all') {
          query += ' AND (c.slug = ? OR c.id = ?)';
          params.push(category, category);
        }

        query += ' ORDER BY w.id DESC';
        const [rows] = await pool.query(query, params);

        const formatted = rows.map(item => ({
          ...item,
          disposal_steps: safeParseJson(item.disposal_steps, []),
          is_recyclable: Boolean(item.is_recyclable)
        }));

        return res.json({ success: true, data: formatted });
      } catch (dbErr) {
        console.warn('DB error di getAdminWasteItems, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    let items = [...inMemoryStore.wasteItems];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || (i.summary && i.summary.toLowerCase().includes(q)));
    }
    if (category && category !== 'all') {
      items = items.filter(i => {
        const cat = inMemoryStore.categories.find(c => c.id === i.category_id);
        return String(i.category_id) === String(category) || (cat && cat.slug === category);
      });
    }

    const formatted = items.map(item => {
      const cat = inMemoryStore.categories.find(c => c.id === item.category_id) || {};
      return {
        ...item,
        category_name: cat.name || 'Umum',
        category_slug: cat.slug || 'anorganik',
        category_color: cat.color || '#3b82f6',
        badge_bg: cat.badge_bg || '#eff6ff',
        badge_text: cat.badge_text || '#1d4ed8',
        disposal_steps: safeParseJson(item.disposal_steps, []),
        is_recyclable: Boolean(item.is_recyclable)
      };
    }).reverse();

    return res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error saat getAdminWasteItems:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data sampah.' });
  }
}

export async function createWasteItem(req, res) {
  try {
    const {
      name,
      slug,
      category_id,
      image_url,
      decomposition_time,
      is_recyclable,
      impact_level,
      summary,
      disposal_steps,
      recycling_potential,
      danger_notes
    } = req.body;

    if (!name || !category_id) {
      return res.status(400).json({ success: false, message: 'Nama sampah dan kategori wajib diisi!' });
    }

    const generatedSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const stepsJson = Array.isArray(disposal_steps) ? JSON.stringify(disposal_steps) : (disposal_steps || '[]');
    const recyclableVal = is_recyclable === false || is_recyclable === 0 ? 0 : 1;

    if (isDbConnected()) {
      try {
        const pool = getPool();
        const [result] = await pool.query(`
          INSERT INTO waste_items (category_id, name, slug, image_url, decomposition_time, is_recyclable, impact_level, summary, disposal_steps, recycling_potential, danger_notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          category_id,
          name.trim(),
          generatedSlug,
          image_url || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
          decomposition_time || 'Tidak diketahui',
          recyclableVal,
          impact_level || 'Sedang',
          summary || '',
          stepsJson,
          recycling_potential || '',
          danger_notes || ''
        ]);

        return res.status(201).json({
          success: true,
          message: 'Data sampah baru berhasil ditambahkan!',
          data: { id: result.insertId, slug: generatedSlug, name }
        });
      } catch (dbErr) {
        console.warn('DB error di createWasteItem, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    const newId = inMemoryStore.wasteItems.length > 0 
      ? Math.max(...inMemoryStore.wasteItems.map(w => w.id)) + 1 
      : 1;

    const newItem = {
      id: newId,
      category_id: Number(category_id),
      name: name.trim(),
      slug: generatedSlug,
      image_url: image_url || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
      decomposition_time: decomposition_time || 'Tidak diketahui',
      is_recyclable: recyclableVal,
      impact_level: impact_level || 'Sedang',
      summary: summary || '',
      disposal_steps: safeParseJson(stepsJson, []),
      recycling_potential: recycling_potential || '',
      danger_notes: danger_notes || '',
      created_at: new Date()
    };

    inMemoryStore.wasteItems.push(newItem);

    return res.status(201).json({
      success: true,
      message: 'Data sampah baru berhasil disimpan!',
      data: newItem
    });
  } catch (error) {
    console.error('Error saat createWasteItem:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menambah data sampah.' });
  }
}

export async function updateWasteItem(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      category_id,
      image_url,
      decomposition_time,
      is_recyclable,
      impact_level,
      summary,
      disposal_steps,
      recycling_potential,
      danger_notes
    } = req.body;

    if (!name || !category_id) {
      return res.status(400).json({ success: false, message: 'Nama sampah dan kategori wajib diisi!' });
    }

    const generatedSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const stepsJson = Array.isArray(disposal_steps) ? JSON.stringify(disposal_steps) : (disposal_steps || '[]');
    const recyclableVal = is_recyclable === false || is_recyclable === 0 ? 0 : 1;

    if (isDbConnected()) {
      try {
        const pool = getPool();
        await pool.query(`
          UPDATE waste_items SET
            category_id = ?,
            name = ?,
            slug = ?,
            image_url = ?,
            decomposition_time = ?,
            is_recyclable = ?,
            impact_level = ?,
            summary = ?,
            disposal_steps = ?,
            recycling_potential = ?,
            danger_notes = ?
          WHERE id = ?
        `, [
          category_id,
          name.trim(),
          generatedSlug,
          image_url,
          decomposition_time,
          recyclableVal,
          impact_level,
          summary,
          stepsJson,
          recycling_potential,
          danger_notes,
          id
        ]);

        return res.json({ success: true, message: 'Data sampah berhasil diperbarui!' });
      } catch (dbErr) {
        console.warn('DB error di updateWasteItem, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    const index = inMemoryStore.wasteItems.findIndex(w => String(w.id) === String(id));
    if (index !== -1) {
      inMemoryStore.wasteItems[index] = {
        ...inMemoryStore.wasteItems[index],
        category_id: Number(category_id),
        name: name.trim(),
        slug: generatedSlug,
        image_url,
        decomposition_time,
        is_recyclable: recyclableVal,
        impact_level,
        summary,
        disposal_steps: safeParseJson(stepsJson, []),
        recycling_potential,
        danger_notes
      };
      return res.json({ success: true, message: 'Data sampah berhasil diperbarui!' });
    }

    return res.status(404).json({ success: false, message: 'Item sampah tidak ditemukan.' });
  } catch (error) {
    console.error('Error saat updateWasteItem:', error);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui item sampah.' });
  }
}

export async function deleteWasteItem(req, res) {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        const pool = getPool();
        await pool.query('DELETE FROM waste_items WHERE id = ?', [id]);
        return res.json({ success: true, message: 'Item sampah berhasil dihapus!' });
      } catch (dbErr) {
        console.warn('DB error di deleteWasteItem, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    const initialLen = inMemoryStore.wasteItems.length;
    inMemoryStore.wasteItems = inMemoryStore.wasteItems.filter(w => String(w.id) !== String(id));
    if (inMemoryStore.wasteItems.length < initialLen) {
      return res.json({ success: true, message: 'Item sampah berhasil dihapus!' });
    }

    return res.status(404).json({ success: false, message: 'Item sampah tidak ditemukan.' });
  } catch (error) {
    console.error('Error saat deleteWasteItem:', error);
    return res.status(500).json({ success: false, message: 'Gagal menghapus item sampah.' });
  }
}

// ==========================================
// 3. DIREKTORI BANK SAMPAH CRUD
// ==========================================
export async function getAdminDropPoints(req, res) {
  try {
    if (isDbConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM drop_points ORDER BY id ASC');
        const formatted = rows.map(dp => ({
          ...dp,
          accepted_types: safeParseJson(dp.accepted_types, [])
        }));
        return res.json({ success: true, data: formatted });
      } catch (dbErr) {
        console.warn('DB error di getAdminDropPoints, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    const formatted = inMemoryStore.dropPoints.map(dp => ({
      ...dp,
      accepted_types: safeParseJson(dp.accepted_types, [])
    }));
    return res.json({ success: true, data: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data bank sampah.' });
  }
}

export async function createDropPoint(req, res) {
  try {
    const {
      name,
      city,
      address,
      accepted_types,
      opening_hours,
      contact_phone,
      incentive,
      latitude,
      longitude,
      map_link
    } = req.body;

    if (!name || !address || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Nama, alamat, latitude, dan longitude wajib diisi!' });
    }

    const acceptedJson = Array.isArray(accepted_types) ? JSON.stringify(accepted_types) : (accepted_types || '[]');
    const mapUrl = map_link || `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    if (isDbConnected()) {
      try {
        const pool = getPool();
        const [result] = await pool.query(`
          INSERT INTO drop_points (name, city, address, accepted_types, opening_hours, contact_phone, incentive, latitude, longitude, map_link)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          name.trim(),
          city || 'Kota Bandung',
          address.trim(),
          acceptedJson,
          opening_hours || '08:00 - 16:00 WIB',
          contact_phone || '',
          incentive || 'Konversi poin & reward uang tunai',
          latitude,
          longitude,
          mapUrl
        ]);

        return res.status(201).json({
          success: true,
          message: 'Lokasi Bank Sampah berhasil ditambahkan!',
          data: { id: result.insertId, name }
        });
      } catch (dbErr) {
        console.warn('DB error di createDropPoint, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    const newId = inMemoryStore.dropPoints.length > 0 
      ? Math.max(...inMemoryStore.dropPoints.map(d => d.id)) + 1 
      : 1;

    const newDp = {
      id: newId,
      name: name.trim(),
      city: city || 'Kota Bandung',
      address: address.trim(),
      accepted_types: safeParseJson(acceptedJson, []),
      opening_hours: opening_hours || '08:00 - 16:00 WIB',
      contact_phone: contact_phone || '',
      incentive: incentive || 'Konversi poin & reward uang tunai',
      latitude: Number(latitude),
      longitude: Number(longitude),
      map_link: mapUrl
    };

    inMemoryStore.dropPoints.push(newDp);

    return res.status(201).json({
      success: true,
      message: 'Lokasi Bank Sampah berhasil ditambahkan!',
      data: newDp
    });
  } catch (error) {
    console.error('Error saat createDropPoint:', error);
    return res.status(500).json({ success: false, message: 'Gagal menambah bank sampah.' });
  }
}

export async function updateDropPoint(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      city,
      address,
      accepted_types,
      opening_hours,
      contact_phone,
      incentive,
      latitude,
      longitude,
      map_link
    } = req.body;

    if (!name || !address || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Nama, alamat, latitude, dan longitude wajib diisi!' });
    }

    const acceptedJson = Array.isArray(accepted_types) ? JSON.stringify(accepted_types) : (accepted_types || '[]');
    const mapUrl = map_link || `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    if (isDbConnected()) {
      try {
        const pool = getPool();
        await pool.query(`
          UPDATE drop_points SET
            name = ?,
            city = ?,
            address = ?,
            accepted_types = ?,
            opening_hours = ?,
            contact_phone = ?,
            incentive = ?,
            latitude = ?,
            longitude = ?,
            map_link = ?
          WHERE id = ?
        `, [
          name.trim(),
          city,
          address.trim(),
          acceptedJson,
          opening_hours,
          contact_phone,
          incentive,
          latitude,
          longitude,
          mapUrl,
          id
        ]);

        return res.json({ success: true, message: 'Data Bank Sampah berhasil diperbarui!' });
      } catch (dbErr) {
        console.warn('DB error di updateDropPoint, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    const index = inMemoryStore.dropPoints.findIndex(d => String(d.id) === String(id));
    if (index !== -1) {
      inMemoryStore.dropPoints[index] = {
        ...inMemoryStore.dropPoints[index],
        name: name.trim(),
        city,
        address: address.trim(),
        accepted_types: safeParseJson(acceptedJson, []),
        opening_hours,
        contact_phone,
        incentive,
        latitude: Number(latitude),
        longitude: Number(longitude),
        map_link: mapUrl
      };
      return res.json({ success: true, message: 'Data Bank Sampah berhasil diperbarui!' });
    }

    return res.status(404).json({ success: false, message: 'Bank Sampah tidak ditemukan.' });
  } catch (error) {
    console.error('Error saat updateDropPoint:', error);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui data bank sampah.' });
  }
}

export async function deleteDropPoint(req, res) {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        const pool = getPool();
        await pool.query('DELETE FROM drop_points WHERE id = ?', [id]);
        return res.json({ success: true, message: 'Bank Sampah berhasil dihapus!' });
      } catch (dbErr) {
        console.warn('DB error di deleteDropPoint, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    const initialLen = inMemoryStore.dropPoints.length;
    inMemoryStore.dropPoints = inMemoryStore.dropPoints.filter(d => String(d.id) !== String(id));
    if (inMemoryStore.dropPoints.length < initialLen) {
      return res.json({ success: true, message: 'Bank Sampah berhasil dihapus!' });
    }

    return res.status(404).json({ success: false, message: 'Bank Sampah tidak ditemukan.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus data bank sampah.' });
  }
}

// ==========================================
// 4. KUIS & SOAL CRUD
// ==========================================
export async function getAdminQuizzes(req, res) {
  try {
    if (isDbConnected()) {
      try {
        const pool = getPool();
        const [quizzes] = await pool.query('SELECT * FROM quizzes ORDER BY id ASC');
        const [questions] = await pool.query('SELECT * FROM questions ORDER BY quiz_id ASC, id ASC');

        const populated = quizzes.map(q => ({
          ...q,
          questions: questions
            .filter(quest => quest.quiz_id === q.id)
            .map(quest => ({ ...quest, options: safeParseJson(quest.options, []) }))
        }));

        return res.json({ success: true, data: populated });
      } catch (dbErr) {
        console.warn('DB error di getAdminQuizzes, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    const populated = inMemoryStore.quizzes.map(q => ({
      ...q,
      questions: inMemoryStore.questions
        .filter(quest => quest.quiz_id === q.id)
        .map(quest => ({ ...quest, options: safeParseJson(quest.options, []) }))
    }));

    return res.json({ success: true, data: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data kuis.' });
  }
}

export async function createQuiz(req, res) {
  try {
    const { title, slug, description, difficulty, duration_minutes, reward_points, icon, badge_name, questions } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Judul kuis wajib diisi!' });
    }

    const generatedSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (isDbConnected()) {
      try {
        const pool = getPool();
        const [result] = await pool.query(`
          INSERT INTO quizzes (title, slug, description, difficulty, duration_minutes, reward_points, icon, badge_name)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          title.trim(),
          generatedSlug,
          description || '',
          difficulty || 'Mudah',
          duration_minutes || 5,
          reward_points || 100,
          icon || 'Recycle',
          badge_name || 'Master Pemilah'
        ]);

        const quizId = result.insertId;

        if (Array.isArray(questions) && questions.length > 0) {
          for (const q of questions) {
            await pool.query(`
              INSERT INTO questions (quiz_id, question_text, options, correct_answer, explanation)
              VALUES (?, ?, ?, ?, ?)
            `, [
              quizId,
              q.question_text,
              JSON.stringify(q.options || []),
              q.correct_answer,
              q.explanation || ''
            ]);
          }
        }

        return res.status(201).json({ success: true, message: 'Kuis berhasil dibuat!', data: { id: quizId } });
      } catch (dbErr) {
        console.warn('DB error di createQuiz, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    const newId = inMemoryStore.quizzes.length > 0 ? Math.max(...inMemoryStore.quizzes.map(q => q.id)) + 1 : 1;
    const newQuiz = {
      id: newId,
      title: title.trim(),
      slug: generatedSlug,
      description: description || '',
      difficulty: difficulty || 'Mudah',
      duration_minutes: duration_minutes || 5,
      reward_points: reward_points || 100,
      icon: icon || 'Recycle',
      badge_name: badge_name || 'Master Pemilah'
    };
    inMemoryStore.quizzes.push(newQuiz);

    if (Array.isArray(questions) && questions.length > 0) {
      questions.forEach((q, idx) => {
        const questId = inMemoryStore.questions.length > 0 ? Math.max(...inMemoryStore.questions.map(quest => quest.id)) + 1 : idx + 1;
        inMemoryStore.questions.push({
          id: questId,
          quiz_id: newId,
          question_text: q.question_text,
          options: safeParseJson(q.options, []),
          correct_answer: q.correct_answer,
          explanation: q.explanation || ''
        });
      });
    }

    return res.status(201).json({ success: true, message: 'Kuis berhasil dibuat!', data: newQuiz });
  } catch (error) {
    console.error('Error saat createQuiz:', error);
    return res.status(500).json({ success: false, message: 'Gagal membuat kuis.' });
  }
}

export async function deleteQuiz(req, res) {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        const pool = getPool();
        await pool.query('DELETE FROM quizzes WHERE id = ?', [id]);
        return res.json({ success: true, message: 'Kuis berhasil dihapus!' });
      } catch (dbErr) {
        console.warn('DB error di deleteQuiz, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    inMemoryStore.quizzes = inMemoryStore.quizzes.filter(q => String(q.id) !== String(id));
    inMemoryStore.questions = inMemoryStore.questions.filter(q => String(q.quiz_id) !== String(id));

    return res.json({ success: true, message: 'Kuis berhasil dihapus!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus kuis.' });
  }
}

// ==========================================
// 5. MONITORING SCAN AI LOGS
// ==========================================
export async function getScanLogs(req, res) {
  try {
    if (isDbConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query(`
          SELECT s.*, u.name as user_name, u.email as user_email
          FROM waste_scans s
          LEFT JOIN users u ON s.user_id = u.id
          ORDER BY s.created_at DESC
          LIMIT 100
        `);
        return res.json({ success: true, data: rows });
      } catch (dbErr) {
        console.warn('DB error di getScanLogs, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    const rows = (inMemoryStore.scans || []).map(s => {
      const u = inMemoryStore.users.find(user => user.id === s.user_id) || {};
      return {
        ...s,
        user_name: u.name || 'Pengguna Tamu',
        user_email: u.email || '-'
      };
    }).reverse();

    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil log scan AI.' });
  }
}

export async function deleteScanLog(req, res) {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        const pool = getPool();
        await pool.query('DELETE FROM waste_scans WHERE id = ?', [id]);
        return res.json({ success: true, message: 'Log scan berhasil dihapus!' });
      } catch (dbErr) {
        console.warn('DB error di deleteScanLog, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    if (inMemoryStore.scans) {
      inMemoryStore.scans = inMemoryStore.scans.filter(s => String(s.id) !== String(id));
    }
    return res.json({ success: true, message: 'Log scan berhasil dihapus!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus log scan.' });
  }
}

// ==========================================
// 6. MANAJEMEN PENGGUNA & GAMIFIKASI
// ==========================================
export async function getAllUsers(req, res) {
  try {
    const { search, role } = req.query;

    if (isDbConnected()) {
      try {
        const pool = getPool();
        let query = 'SELECT id, name, email, role, points, avatar, institution, phone, created_at FROM users WHERE 1=1';
        const params = [];

        if (search) {
          query += ' AND (name LIKE ? OR email LIKE ? OR institution LIKE ?)';
          params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (role && role !== 'all') {
          query += ' AND role = ?';
          params.push(role);
        }

        query += ' ORDER BY points DESC, created_at DESC';
        const [rows] = await pool.query(query, params);
        return res.json({ success: true, data: rows });
      } catch (dbErr) {
        console.warn('DB error di getAllUsers, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    let users = [...inMemoryStore.users];
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) || 
        (u.institution && u.institution.toLowerCase().includes(q))
      );
    }
    if (role && role !== 'all') {
      users = users.filter(u => u.role === role);
    }

    const sanitized = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      points: u.points,
      avatar: u.avatar,
      institution: u.institution || 'Universitas Teknologi Bandung',
      phone: u.phone || '-',
      created_at: u.created_at
    })).sort((a, b) => b.points - a.points);

    return res.json({ success: true, data: sanitized });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data pengguna.' });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role harus berupa "user" atau "admin".' });
    }

    // Cegah admin mencabut akses dirinya sendiri jika hanya ada 1 admin
    if (req.user.id === Number(id) && role === 'user') {
      return res.status(400).json({ success: false, message: 'Anda tidak dapat menurunkan role akun Anda sendiri.' });
    }

    if (isDbConnected()) {
      try {
        const pool = getPool();
        await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        return res.json({ success: true, message: `Role pengguna berhasil diubah menjadi ${role}!` });
      } catch (dbErr) {
        console.warn('DB error di updateUserRole, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    const user = inMemoryStore.users.find(u => String(u.id) === String(id));
    if (user) {
      user.role = role;
      return res.json({ success: true, message: `Role pengguna berhasil diubah menjadi ${role}!` });
    }

    return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengubah role pengguna.' });
  }
}

export async function adjustUserPoints(req, res) {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    const delta = Number(amount);
    if (isNaN(delta) || delta === 0) {
      return res.status(400).json({ success: false, message: 'Jumlah poin tidak valid (harus angka bukan 0).' });
    }

    if (isDbConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT points FROM users WHERE id = ?', [id]);
        if (rows.length === 0) {
          return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
        }

        const newPoints = Math.max(0, (rows[0].points || 0) + delta);
        await pool.query('UPDATE users SET points = ? WHERE id = ?', [newPoints, id]);

        return res.json({
          success: true,
          message: `Berhasil menyesuaikan poin pengguna (${delta > 0 ? '+' : ''}${delta} poin). Saldo baru: ${newPoints} poin.`,
          data: { newPoints, reason: reason || 'Penyesuaian manual oleh admin' }
        });
      } catch (dbErr) {
        console.warn('DB error di adjustUserPoints, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    const user = inMemoryStore.users.find(u => String(u.id) === String(id));
    if (user) {
      user.points = Math.max(0, (user.points || 0) + delta);
      return res.json({
        success: true,
        message: `Berhasil menyesuaikan poin pengguna (${delta > 0 ? '+' : ''}${delta} poin). Saldo baru: ${user.points} poin.`,
        data: { newPoints: user.points, reason: reason || 'Penyesuaian manual oleh admin' }
      });
    }

    return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menyesuaikan poin pengguna.' });
  }
}

export async function getCalculatorSettings(req, res) {
  try {
    return res.json({
      success: true,
      data: calculatorSettings
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil pengaturan kalkulator.' });
  }
}

export async function updateCalculatorSettings(req, res) {
  try {
    const { activeCode, rewardPoints, cooldownDays } = req.body || {};

    if (activeCode !== undefined) {
      if (!activeCode || typeof activeCode !== 'string' || !activeCode.trim()) {
        return res.status(400).json({ success: false, message: 'Kode voucher tidak boleh kosong.' });
      }
      calculatorSettings.activeCode = activeCode.trim().toUpperCase();
    }

    if (rewardPoints !== undefined) {
      const pts = Number(rewardPoints);
      if (isNaN(pts) || pts <= 0) {
        return res.status(400).json({ success: false, message: 'Jumlah reward poin harus berupa angka positif.' });
      }
      calculatorSettings.rewardPoints = pts;
    }

    if (cooldownDays !== undefined) {
      const days = Number(cooldownDays);
      if (isNaN(days) || days <= 0) {
        return res.status(400).json({ success: false, message: 'Batas cooldown hari harus berupa angka positif.' });
      }
      calculatorSettings.cooldownDays = days;
    }

    return res.json({
      success: true,
      message: 'Pengaturan kode bonus kalkulator berhasil diperbarui!',
      data: calculatorSettings
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui pengaturan kalkulator.' });
  }
}
