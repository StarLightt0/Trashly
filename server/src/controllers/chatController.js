import { getPool, isDbConnected, inMemoryStore } from '../config/db.js';
import { initialWasteItems } from '../seeds/initialData.js';

// RAG Helper: Cari maksimal 5 item paling relevan berdasarkan kecocokan kata kunci
function getRelevantWasteItems(allItems, userMessage) {
  if (!allItems || allItems.length === 0) return [];

  const words = userMessage
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3);

  if (words.length === 0) return allItems.slice(0, 3);

  const scored = allItems.map(item => {
    let score = 0;
    const name = (item.name || '').toLowerCase();
    const summary = (item.summary || '').toLowerCase();
    const catName = (item.category_name || '').toLowerCase();
    const potential = (item.recycling_potential || '').toLowerCase();

    for (const w of words) {
      if (name.includes(w)) score += 5;
      if (catName.includes(w)) score += 3;
      if (summary.includes(w)) score += 2;
      if (potential.includes(w)) score += 1;
    }

    return { item, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.item);
}

function formatWasteContext(items) {
  if (!items || items.length === 0) {
    return 'Tidak ada entri ensiklopedia khusus yang cocok langsung.';
  }
  return items.map((it, idx) => {
    return `${idx + 1}. ${it.name} (${it.category_name || 'Umum'}): ${it.summary || ''} | Daur Ulang: ${it.is_recyclable ? 'Bisa' : 'Tidak'} | Potensi: ${it.recycling_potential || '-'}`;
  }).join('\n');
}

export async function chat(req, res) {
  try {
    const { message, history = [] } = req.body;

    // 1. Validasi input pesan
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Pesan pertanyaan wajib diisi.'
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Pesan pertanyaan maksimal 500 karakter.'
      });
    }

    // 2. Validasi & sanitasi history (maksimal 10 pesan terakhir, hanya role user & assistant)
    const validHistory = Array.isArray(history) ? history : [];
    const cleanHistory = validHistory
      .slice(-10)
      .filter(h => (h.role === 'user' || h.role === 'assistant') && typeof h.text === 'string' && h.text.trim() !== '');

    // 3. Cek Kunci API & Model Gemini
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    const model = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message: 'Layanan Chatbot AI sedang tidak tersedia (kunci API belum dikonfigurasi).'
      });
    }

    // 4. RAG Sederhana: Ambil data waste_items
    let allWasteItems = [];
    if (isDbConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query(`
          SELECT 
            w.name, 
            w.summary, 
            w.disposal_steps, 
            w.recycling_potential, 
            w.danger_notes, 
            w.is_recyclable,
            c.name as category_name
          FROM waste_items w
          LEFT JOIN categories c ON w.category_id = c.id
        `);
        if (rows && rows.length > 0) allWasteItems = rows;
      } catch (dbErr) {
        allWasteItems = inMemoryStore.wasteItems || initialWasteItems;
      }
    } else {
      allWasteItems = inMemoryStore.wasteItems || initialWasteItems;
    }

    const relevantItems = getRelevantWasteItems(allWasteItems, trimmedMessage);
    const ragContext = formatWasteContext(relevantItems);

    // 5. System Instruction untuk Gemini REST API
    const systemInstruction = `Kamu adalah 'Trashly AI', asisten cerdas pemilahan dan pengelolaan sampah interaktif untuk platform Trashly (berstandar KLHK Indonesia).

ATURAN UTAMA:
1. Berikan jawaban yang singkat, padat, ramah, dan praktis dalam Bahasa Indonesia.
2. HANYA jawab pertanyaan seputar pemilahan, pengelolaan, daur ulang (prinsip 3R: Reduce, Reuse, Recycle), komposting, bahaya limbah B3/residu, dan bank sampah.
3. JIKA pengguna menanyakan topik di luar persampahan atau lingkungan (misalnya politik, matematika, programming umum, selebriti, resep masakan, dll.), TOLAK DENGAN SOPAN dan katakan bahwa kamu adalah asisten khusus pemilahan sampah Trashly.
4. JANGAN mengarang data atau fakta. Bila informasi tidak kamu ketahui atau kamu tidak yakin, katakan secara jujur bahwa kamu tidak yakin.
5. Gunakan data 'Referensi Ensiklopedia Trashly' di bawah ini sebagai rujukan utama agar jawabanmu selalu konsisten dengan data aplikasi Trashly.

Referensi Ensiklopedia Trashly:
${ragContext}`;

    // 6. Siapkan Payload Gemini REST API
    const contents = cleanHistory.map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.text }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: trimmedMessage }]
    });

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 600
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        console.warn('Gemini chat API responded with status:', response.status, errJson);
        return res.status(503).json({
          success: false,
          message: 'Layanan Chatbot AI sedang tidak tersedia. Silakan coba lagi nanti.'
        });
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) {
        return res.status(503).json({
          success: false,
          message: 'Layanan Chatbot AI tidak menghasilkan respons. Silakan coba ajukan pertanyaan lagi.'
        });
      }

      return res.json({
        success: true,
        reply: reply.trim()
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.warn('Gemini chat fetch error:', fetchError.message);
      return res.status(503).json({
        success: false,
        message: 'Layanan Chatbot AI sedang tidak tersedia atau waktu permintaan habis. Silakan coba lagi nanti.'
      });
    }

  } catch (error) {
    console.error('Error di chatController:', error);
    return res.status(503).json({
      success: false,
      message: 'Layanan Chatbot AI sedang mengalami kendala. Silakan coba lagi nanti.'
    });
  }
}
