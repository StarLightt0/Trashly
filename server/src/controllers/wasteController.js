import { getPool, isDbConnected, inMemoryStore } from '../config/db.js';
import { safeParseJson } from '../utils/helpers.js';

export async function getCategories(req, res) {
  try {
    if (isDbConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY id ASC');
        if (rows && rows.length > 0) {
          return res.json({ success: true, data: rows });
        }
      } catch (dbErr) {
        console.warn('DB error di getCategories, fallback ke inMemoryStore:', dbErr.message);
      }
    }
    return res.json({ success: true, data: inMemoryStore.categories });
  } catch (error) {
    console.error('Error saat getCategories:', error);
    return res.json({ success: true, data: inMemoryStore.categories });
  }
}

export async function getAllWaste(req, res) {
  try {
    const { search, category, recyclable } = req.query;

    if (isDbConnected()) {
      try {
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
          LEFT JOIN categories c ON w.category_id = c.id
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
        
        if (rows && rows.length > 0) {
          const formatted = rows.map(item => ({
            ...item,
            category_name: item.category_name || 'Anorganik',
            category_slug: item.category_slug || 'anorganik',
            category_color: item.category_color || '#2563EB',
            badge_bg: item.badge_bg || '#DBEAFE',
            badge_text: item.badge_text || '#1D4ED8',
            category_icon: item.category_icon || 'Recycle',
            disposal_steps: safeParseJson(item.disposal_steps)
          }));

          return res.json({ success: true, total: formatted.length, data: formatted });
        }
      } catch (dbErr) {
        console.warn('DB error di getAllWaste, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    // In-Memory Fallback
    let items = inMemoryStore.wasteItems.map(w => {
      const cat = inMemoryStore.categories.find(c => c.id === w.category_id) || {};
      return {
        ...w,
        category_name: cat.name || 'Umum',
        category_slug: cat.slug || 'anorganik',
        category_color: cat.color || '#2563EB',
        badge_bg: cat.badge_bg || '#DBEAFE',
        badge_text: cat.badge_text || '#1D4ED8',
        category_icon: cat.icon || 'Recycle',
        disposal_steps: safeParseJson(w.disposal_steps)
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
  } catch (error) {
    console.error('Error saat getAllWaste:', error);
    return res.json({ success: true, total: inMemoryStore.wasteItems.length, data: inMemoryStore.wasteItems });
  }
}

export async function getWasteDetail(req, res) {
  try {
    const { identifier } = req.params;

    if (isDbConnected()) {
      try {
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
          LEFT JOIN categories c ON w.category_id = c.id
          WHERE ${isNum ? 'w.id = ?' : 'w.slug = ?'}
        `;
        const [rows] = await pool.query(query, [identifier]);

        if (rows && rows.length > 0) {
          const item = rows[0];
          return res.json({
            success: true,
            data: {
              ...item,
              category_name: item.category_name || 'Umum',
              category_slug: item.category_slug || 'anorganik',
              category_color: item.category_color || '#2563EB',
              badge_bg: item.badge_bg || '#DBEAFE',
              badge_text: item.badge_text || '#1D4ED8',
              category_icon: item.category_icon || 'Recycle',
              disposal_steps: safeParseJson(item.disposal_steps)
            }
          });
        }
      } catch (dbErr) {
        console.warn('DB error di getWasteDetail, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    // In-Memory Fallback
    const isNum = !isNaN(identifier);
    const item = inMemoryStore.wasteItems.find(w => isNum ? w.id === parseInt(identifier, 10) : w.slug === identifier);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Informasi sampah tidak ditemukan.' });
    }

    const cat = inMemoryStore.categories.find(c => c.id === item.category_id) || {};
    const fullItem = {
      ...item,
      category_name: cat.name || 'Umum',
      category_slug: cat.slug || 'anorganik',
      category_color: cat.color || '#2563EB',
      badge_bg: cat.badge_bg || '#DBEAFE',
      badge_text: cat.badge_text || '#1D4ED8',
      category_icon: cat.icon || 'Recycle',
      category_description: cat.description || '',
      disposal_steps: safeParseJson(item.disposal_steps)
    };

    return res.json({ success: true, data: fullItem });
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
      try {
        const pool = getPool();
        const [itemsCount] = await pool.query('SELECT COUNT(*) as count FROM waste_items');
        const [recCount] = await pool.query('SELECT COUNT(*) as count FROM waste_items WHERE is_recyclable = 1');
        const [catsCount] = await pool.query('SELECT COUNT(*) as count FROM categories');
        totalItems = itemsCount[0]?.count || 0;
        totalRecyclable = recCount[0]?.count || 0;
        totalCategories = catsCount[0]?.count || 0;
      } catch (dbErr) {
        console.warn('DB error di getStats, fallback ke inMemoryStore:', dbErr.message);
      }
    }

    if (totalItems === 0) {
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
    return res.json({
      success: true,
      data: {
        totalItems: inMemoryStore.wasteItems.length,
        totalRecyclable: inMemoryStore.wasteItems.filter(w => w.is_recyclable === 1).length,
        recyclablePercentage: 67,
        totalCategories: inMemoryStore.categories.length
      }
    });
  }
}
