import { getPool, isDbConnected, inMemoryStore } from '../config/db.js';
import { safeParseJson } from '../utils/helpers.js';

export async function getDropPoints(req, res) {
  try {
    const { city, type, search } = req.query;

    if (isDbConnected()) {
      try {
        const pool = getPool();
        let query = 'SELECT * FROM drop_points WHERE 1=1';
        const params = [];

        if (city && city !== 'all') {
          query += ' AND city = ?';
          params.push(city);
        }

        if (search && search.trim() !== '') {
          query += ' AND (name LIKE ? OR address LIKE ? OR city LIKE ?)';
          const term = `%${search.trim()}%`;
          params.push(term, term, term);
        }

        query += ' ORDER BY id ASC';

        const [rows] = await pool.query(query, params);
        
        if (rows && rows.length > 0) {
          let formatted = rows.map(item => ({
            ...item,
            accepted_types: safeParseJson(item.accepted_types)
          }));

          if (type && type !== 'all') {
            formatted = formatted.filter(item => 
              Array.isArray(item.accepted_types) && 
              item.accepted_types.some(t => t.toLowerCase().includes(type.toLowerCase()))
            );
          }

          return res.json({ success: true, total: formatted.length, data: formatted });
        }
      } catch (dbErr) {
        console.warn('DB error di getDropPoints, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    // In-memory fallback
    let items = inMemoryStore.dropPoints.map(dp => ({
      ...dp,
      accepted_types: safeParseJson(dp.accepted_types)
    }));

    if (city && city !== 'all') {
      items = items.filter(dp => dp.city.toLowerCase() === city.toLowerCase());
    }

    if (search && search.trim() !== '') {
      const s = search.trim().toLowerCase();
      items = items.filter(dp => 
        dp.name.toLowerCase().includes(s) ||
        dp.address.toLowerCase().includes(s) ||
        dp.city.toLowerCase().includes(s)
      );
    }

    if (type && type !== 'all') {
      items = items.filter(dp => 
        Array.isArray(dp.accepted_types) && 
        dp.accepted_types.some(t => t.toLowerCase().includes(type.toLowerCase()))
      );
    }

    return res.json({ success: true, total: items.length, data: items });
  } catch (error) {
    console.error('Error saat getDropPoints:', error);
    return res.json({ success: true, total: inMemoryStore.dropPoints.length, data: inMemoryStore.dropPoints });
  }
}

export async function getDropPointDetail(req, res) {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM drop_points WHERE id = ?', [id]);
        if (rows && rows.length > 0) {
          const item = rows[0];
          return res.json({
            success: true,
            data: {
              ...item,
              accepted_types: safeParseJson(item.accepted_types)
            }
          });
        }
      } catch (dbErr) {
        console.warn('DB error di getDropPointDetail, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    const item = inMemoryStore.dropPoints.find(dp => String(dp.id) === String(id));
    if (!item) {
      return res.status(404).json({ success: false, message: 'Titik bank sampah tidak ditemukan.' });
    }

    return res.json({
      success: true,
      data: {
        ...item,
        accepted_types: safeParseJson(item.accepted_types)
      }
    });
  } catch (error) {
    console.error('Error saat getDropPointDetail:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail bank sampah.' });
  }
}
