import { getPool, isDbConnected, inMemoryStore } from '../config/db.js';

export async function getDropPoints(req, res) {
  try {
    const { city, type, search } = req.query;

    if (isDbConnected()) {
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
      
      let formatted = rows.map(item => ({
        ...item,
        accepted_types: typeof item.accepted_types === 'string' ? JSON.parse(item.accepted_types) : item.accepted_types
      }));

      if (type && type !== 'all') {
        formatted = formatted.filter(item => 
          Array.isArray(item.accepted_types) && 
          item.accepted_types.some(t => t.toLowerCase().includes(type.toLowerCase()))
        );
      }

      return res.json({ success: true, total: formatted.length, data: formatted });
    } else {
      let items = inMemoryStore.dropPoints.map(dp => ({
        ...dp,
        accepted_types: typeof dp.accepted_types === 'string' ? JSON.parse(dp.accepted_types) : dp.accepted_types
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
    }
  } catch (error) {
    console.error('Error saat getDropPoints:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data titik bank sampah.' });
  }
}
