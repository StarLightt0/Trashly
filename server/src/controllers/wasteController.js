import { getPool, isDbConnected, inMemoryStore } from '../config/db.js';

export async function getCategories(req, res) {
  try {
    if (isDbConnected()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM categories ORDER BY id ASC');
      return res.json({ success: true, data: rows });
    } else {
      return res.json({ success: true, data: inMemoryStore.categories });
    }
  } catch (error) {
    console.error('Error saat getCategories:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data kategori sampah.' });
  }
}

export async function getAllWaste(req, res) {
  try {
    const { search, category, recyclable } = req.query;

    if (isDbConnected()) {
      const pool = getPool();
      let query = `
        SELECT 
          w.*,
          c.name as category_name,
          c.slug as category_slug,
          c.color as category_color,
          c.badge_bg,
          c.badge_text,
          c.icon as category_icon
        FROM waste_items w
        JOIN categories c ON w.category_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (category && category !== 'all') {
        query += ' AND (c.slug = ? OR c.id = ?)';
        params.push(category, category);
      }

      if (search && search.trim() !== '') {
        query += ' AND (w.name LIKE ? OR w.summary LIKE ? OR w.recycling_potential LIKE ?)';
        const term = `%${search.trim()}%`;
        params.push(term, term, term);
      }

      if (recyclable !== undefined && recyclable !== '') {
        query += ' AND w.is_recyclable = ?';
        params.push(recyclable === 'true' || recyclable === '1' ? 1 : 0);
      }

      query += ' ORDER BY w.id ASC';

      const [rows] = await pool.query(query, params);
      
      // Parse JSON disposal_steps if string
      const formatted = rows.map(item => ({
        ...item,
        disposal_steps: typeof item.disposal_steps === 'string' ? JSON.parse(item.disposal_steps) : item.disposal_steps
      }));

      return res.json({ success: true, total: formatted.length, data: formatted });
    } else {
      // In-Memory Fallback
      let items = inMemoryStore.wasteItems.map(w => {
        const cat = inMemoryStore.categories.find(c => c.id === w.category_id) || {};
        return {
          ...w,
          category_name: cat.name,
          category_slug: cat.slug,
          category_color: cat.color,
          badge_bg: cat.badge_bg,
          badge_text: cat.badge_text,
          category_icon: cat.icon,
          disposal_steps: typeof w.disposal_steps === 'string' ? JSON.parse(w.disposal_steps) : w.disposal_steps
        };
      });

      if (category && category !== 'all') {
        items = items.filter(i => i.category_slug === category || String(i.category_id) === String(category));
      }

      if (search && search.trim() !== '') {
        const s = search.trim().toLowerCase();
        items = items.filter(i => 
          i.name.toLowerCase().includes(s) || 
          (i.summary && i.summary.toLowerCase().includes(s)) ||
          (i.recycling_potential && i.recycling_potential.toLowerCase().includes(s))
        );
      }

      if (recyclable !== undefined && recyclable !== '') {
        const isRec = recyclable === 'true' || recyclable === '1';
        items = items.filter(i => Boolean(i.is_recyclable) === isRec);
      }

      return res.json({ success: true, total: items.length, data: items });
    }
  } catch (error) {
    console.error('Error saat getAllWaste:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data ensiklopedia sampah.' });
  }
}

export async function getWasteDetail(req, res) {
  try {
    const { identifier } = req.params;

    if (isDbConnected()) {
      const pool = getPool();
      const isNum = !isNaN(identifier);
      const query = `
        SELECT 
          w.*,
          c.name as category_name,
          c.slug as category_slug,
          c.color as category_color,
          c.badge_bg,
          c.badge_text,
          c.icon as category_icon,
          c.description as category_description
        FROM waste_items w
        JOIN categories c ON w.category_id = c.id
        WHERE ${isNum ? 'w.id = ?' : 'w.slug = ?'}
      `;
      const [rows] = await pool.query(query, [identifier]);

      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Informasi sampah tidak ditemukan.' });
      }

      const item = rows[0];
      item.disposal_steps = typeof item.disposal_steps === 'string' ? JSON.parse(item.disposal_steps) : item.disposal_steps;

      return res.json({ success: true, data: item });
    } else {
      const isNum = !isNaN(identifier);
      const item = inMemoryStore.wasteItems.find(w => isNum ? w.id === parseInt(identifier, 10) : w.slug === identifier);

      if (!item) {
        return res.status(404).json({ success: false, message: 'Informasi sampah tidak ditemukan.' });
      }

      const cat = inMemoryStore.categories.find(c => c.id === item.category_id) || {};
      const fullItem = {
        ...item,
        category_name: cat.name,
        category_slug: cat.slug,
        category_color: cat.color,
        badge_bg: cat.badge_bg,
        badge_text: cat.badge_text,
        category_icon: cat.icon,
        category_description: cat.description,
        disposal_steps: typeof item.disposal_steps === 'string' ? JSON.parse(item.disposal_steps) : item.disposal_steps
      };

      return res.json({ success: true, data: fullItem });
    }
  } catch (error) {
    console.error('Error saat getWasteDetail:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail sampah.' });
  }
}

export async function getStats(req, res) {
  try {
    let totalItems = 0;
    let totalRecyclable = 0;
    let totalCategories = 0;

    if (isDbConnected()) {
      const pool = getPool();
      const [itemsCount] = await pool.query('SELECT COUNT(*) as count FROM waste_items');
      const [recCount] = await pool.query('SELECT COUNT(*) as count FROM waste_items WHERE is_recyclable = 1');
      const [catsCount] = await pool.query('SELECT COUNT(*) as count FROM categories');
      totalItems = itemsCount[0].count;
      totalRecyclable = recCount[0].count;
      totalCategories = catsCount[0].count;
    } else {
      totalItems = inMemoryStore.wasteItems.length;
      totalRecyclable = inMemoryStore.wasteItems.filter(w => w.is_recyclable === 1).length;
      totalCategories = inMemoryStore.categories.length;
    }

    return res.json({
      success: true,
      data: {
        totalItems,
        totalRecyclable,
        recyclablePercentage: totalItems > 0 ? Math.round((totalRecyclable / totalItems) * 100) : 0,
        totalCategories
      }
    });
  } catch (error) {
    console.error('Error saat getStats:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil statistik sampah.' });
  }
}
