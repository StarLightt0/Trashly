import { getPool, isDbConnected, inMemoryStore } from '../config/db.js';
import { initialWasteItems } from '../seeds/initialData.js';
import { safeParseJson } from '../utils/helpers.js';

// Predefined verified samples for fast 1-click testing
export const samplePresets = [
  {
    id: 'sample-botol-pet',
    name: 'Botol Plastik PET Air Mineral',
    hint: 'botol plastik pet minuman bening aqua mineral',
    thumbnail: 'https://images.unsplash.com/photo-1526951521990-620dc14c214b?auto=format&fit=crop&w=600&q=80',
    category: 'anorganik'
  },
  {
    id: 'sample-kulit-buah',
    name: 'Sisa Buah & Sayuran Dapur',
    hint: 'sisa buah sayur organik kompos sisa makanan kulit pisang',
    thumbnail: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    category: 'organik'
  },
  {
    id: 'sample-kaleng-aluminium',
    name: 'Kaleng Minuman Bersoda (Aluminium)',
    hint: 'kaleng minuman aluminium soda can logam',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    category: 'anorganik'
  },
  {
    id: 'sample-kardus-karton',
    name: 'Kardus Paket & Kertas Karton',
    hint: 'kardus kertas karton box kardus coklat packing',
    thumbnail: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    category: 'anorganik'
  },
  {
    id: 'sample-baterai-bekas',
    name: 'Baterai Bekas Jam / Remote (B3)',
    hint: 'baterai bekas lithium alkaline b3 baterai jam remote',
    thumbnail: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=600&q=80',
    category: 'b3'
  },
  {
    id: 'sample-styrofoam-wadah',
    name: 'Wadah Makanan Styrofoam (Residu)',
    hint: 'styrofoam gabus wadah makanan seblak mie residu tpa',
    thumbnail: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    category: 'residu'
  }
];

// Offline Intelligent Classification Catalog
const KNOWLEDGE_BASE = [
  {
    keywords: ['botol', 'plastik', 'pet', 'aqua', 'mineral', 'beverage', 'plastic', 'gelas plastik'],
    name: 'Botol Plastik PET (Kode Daur Ulang #1)',
    category: 'Sampah Anorganik',
    category_slug: 'anorganik',
    bin_name: 'Tempat Sampah Anorganik (Kuning / Biru)',
    bin_color: '#2563EB',
    badge_bg: '#DBEAFE',
    badge_text: '#1D4ED8',
    is_recyclable: true,
    decomposition_time: '450 Tahun',
    economic_value: 'Rp 3.500 - Rp 5.000 / kg di Bank Sampah',
    summary: 'Botol minuman bening berbahan Polyethylene Terephthalate (PET). Sangat diminati industri daur ulang dan memiliki nilai jual tunai di Bank Sampah.',
    disposal_steps: [
      '1. Kosongkan seluruh sisa cairan di dalam botol hingga kering.',
      '2. Lepaskan label plastik merek dan pisahkan tutup botolnya (tutup berbahan HDPE).',
      '3. Remas atau pipihkan botol untuk menghemat 70% volume tempat sampah.',
      '4. Kumpulkan dan setorkan ke Bank Sampah terdekat untuk dicairkan menjadi tabungan.'
    ],
    recycling_potential: 'Dapat didaur ulang 100% menjadi serat polyester (bahan baju jersey, dacron bantal, karpet mobil) atau botol rPET baru.',
    danger_notes: 'Jika dibakar sembarangan, plastik PET melepaskan gas karsinogenik dioksin. Di alam bebas, terpecah menjadi mikroplastik yang meracuni tanah dan air.',
    eco_tip: 'Bawalah botol minum (tumbler) sendiri saat bepergian untuk mencegah timbunan jutaan botol plastik sekali pakai setiap tahun.'
  },
  {
    keywords: ['buah', 'sayur', 'daun', 'makanan', 'organik', 'sisa', 'pisang', 'apel', 'kulit', 'organic', 'food'],
    name: 'Sisa Makanan & Sayuran Organik',
    category: 'Sampah Organik',
    category_slug: 'organik',
    bin_name: 'Tempat Sampah Organik (Hijau)',
    bin_color: '#16A34A',
    badge_bg: '#DCFCE7',
    badge_text: '#15803D',
    is_recyclable: true,
    decomposition_time: '2 - 4 Minggu',
    economic_value: 'Dapat diolah menjadi pupuk kompos atau eco-enzyme bernilai jual',
    summary: 'Limbah bahan pangan hayati yang mudah membusuk dan dapat diurai mikroorganisme tanah menjadi nutrisi alami bagi tanaman.',
    disposal_steps: [
      '1. Tiriskan air atau kuah dari sisa makanan agar tidak menimbulkan bau busuk dan belatung.',
      '2. Pisahkan dari plastik pembungkus, staples, atau tusuk gigi.',
      '3. Masukkan ke dalam komposter rumah tangga, pot biopori, atau ember tumpuk kompos.',
      '4. Untuk kulit buah manis/asam (jeruk, apel, nanas), dapat difermentasi dengan molase menjadi Eco-Enzyme serbaguna.'
    ],
    recycling_potential: 'Menjadi pupuk organik padat (kompos kaya humus), pupuk organik cair (POC), atau pakan maggot BSF berprotein tinggi.',
    danger_notes: 'Jika dibuang tercampur ke TPA tanpa oksigen, limbah organik membusuk anaerobik dan menghasilkan gas metana (CH4) pemicu ledakan TPA dan pemanasan global.',
    eco_tip: 'Terapkan konsep "Habiskan Makananmu" dan buat kompos sederhana menggunakan ember bekas di rumah.'
  },
  {
    keywords: ['kaleng', 'soda', 'aluminium', 'logam', 'coca', 'metal', 'can', 'tin'],
    name: 'Kaleng Minuman Aluminium',
    category: 'Sampah Anorganik',
    category_slug: 'anorganik',
    bin_name: 'Tempat Sampah Anorganik (Kuning / Biru)',
    bin_color: '#2563EB',
    badge_bg: '#DBEAFE',
    badge_text: '#1D4ED8',
    is_recyclable: true,
    decomposition_time: '80 - 200 Tahun',
    economic_value: 'Rp 12.000 - Rp 18.000 / kg di Bank Sampah (Kategori Nilai Tinggi)',
    summary: 'Logam aluminium murni yang merupakan primadona daur ulang sirkular. Memiliki nilai jual tertinggi di antara limbah anorganik rumah tangga.',
    disposal_steps: [
      '1. Bilas bagian dalam kaleng dengan sedikit air untuk menghilangkan sisa sirup atau soda manis.',
      '2. Keringkan kaleng agar tidak mengundang semut.',
      '3. Injak atau pipihkan kaleng hingga gepeng untuk menghemat tempat penyimpanan.',
      '4. Bawa ke Bank Sampah terdekat untuk ditimbang dengan harga jual tinggi.'
    ],
    recycling_potential: 'Aluminium dapat dilebur dan didaur ulang tanpa batas siklus (infinitely recyclable) tanpa kehilangan kualitas sedikit pun.',
    danger_notes: 'Penambangan bijih bauksit untuk aluminium baru membutuhkan energi listrik sangat masif dan merusak hutan tropis.',
    eco_tip: 'Mendaur ulang 1 kaleng aluminium menghemat 95% energi dibanding membuat kaleng baru dari tambang bauksit.'
  },
  {
    keywords: ['kardus', 'kertas', 'karton', 'box', 'paper', 'hvs', 'buku'],
    name: 'Kardus Paket & Kertas Karton',
    category: 'Sampah Anorganik',
    category_slug: 'anorganik',
    bin_name: 'Tempat Sampah Anorganik (Kuning / Biru)',
    bin_color: '#2563EB',
    badge_bg: '#DBEAFE',
    badge_text: '#1D4ED8',
    is_recyclable: true,
    decomposition_time: '2 - 6 Bulan',
    economic_value: 'Rp 1.500 - Rp 2.500 / kg di Bank Sampah',
    summary: 'Serat selulosa kayu yang mudah diproses ulang menjadi pulp kertas dan kemasan sekunder.',
    disposal_steps: [
      '1. Pastikan kardus dalam keadaan kering dan tidak berminyak.',
      '2. Lepaskan lakban plastik, perekat solasi, dan staples logam.',
      '3. Lipat kardus hingga pipih dan ikat dengan rapi sebelum disetor.'
    ],
    recycling_potential: 'Didaur ulang menjadi bubur kertas pulp untuk pembuatan kardus kemasan baru, rak telur, atau kertas daur ulang seni.',
    danger_notes: 'Kertas yang basah atau berminyak tidak dapat didaur ulang mesin pabrik dan akan membusuk menjadi residu.',
    eco_tip: 'Gunakan kedua sisi kertas saat mencetak dan optimalkan dokumen digital.'
  },
  {
    keywords: ['baterai', 'battery', 'aki', 'alkaline', 'lithium', 'b3', 'berbahaya', 'beracun'],
    name: 'Baterai Bekas (Limbah B3)',
    category: 'Sampah B3 (Bahan Berbahaya & Beracun)',
    category_slug: 'b3',
    bin_name: 'Tempat Sampah B3 / Khusus (Merah)',
    bin_color: '#DC2626',
    badge_bg: '#FEE2E2',
    badge_text: '#B91C1C',
    is_recyclable: false,
    decomposition_time: '100+ Tahun (Logam Berat Abadi)',
    economic_value: 'Wajib diserahkan ke Dropbox E-Waste Resmi DLH',
    summary: 'Sumber energi portabel yang mengandung senyawa logam berat sangat beracun seperti Raksa/Merkuri (Hg), Timbal (Pb), Kadmium (Cd), dan Litium (Li).',
    disposal_steps: [
      '1. DILARANG KERAS membuang ke tempat sampah umum atau membakarnya (bisa meledak!).',
      '2. Tutup kedua kutub positif (+) dan negatif (-) menggunakan selotip bening untuk mencegah korsleting.',
      '3. Simpan di wadah toples plastik/kaca kering tersendiri.',
      '4. Bawa ke Dropbox E-Waste Dinas Lingkungan Hidup terdekat (contoh: di Balai Kota Bandung).'
    ],
    recycling_potential: 'Hanya bisa ditangani oleh fasilitas pengolah limbah B3 berizin khusus untuk netralisasi asam dan pemulihan logam.',
    danger_notes: 'Satu butir baterai kancing merkuri yang bocor di tanah dapat mencemari ribuan liter air tanah yang dikonsumsi masyarakat.',
    eco_tip: 'Beralihlah ke baterai isi ulang (rechargeable battery) yang dapat digunakan hingga ratusan kali.'
  },
  {
    keywords: ['styrofoam', 'gabus', 'foam', 'wadah', 'mangkuk mie', 'residu', 'seblak'],
    name: 'Wadah Makanan Styrofoam (Residu)',
    category: 'Sampah Residu',
    category_slug: 'residu',
    bin_name: 'Tempat Sampah Residu (Abu-abu / Hitam)',
    bin_color: '#6B7280',
    badge_bg: '#F3F4F6',
    badge_text: '#374151',
    is_recyclable: false,
    decomposition_time: '500+ Tahun (Hampir Abadi)',
    economic_value: 'Tidak bernilai ekonomi (Masuk TPA residu)',
    summary: 'Plastik polistirena (PS kode #6) yang ditiup dengan gas pentana. Sangat rapuh, sulit didaur ulang secara ekonomis, dan merupakan polutan abadi di perairan.',
    disposal_steps: [
      '1. Bersihkan sisa kuah atau bumbu makanan yang menempel.',
      '2. Buang ke tempat sampah residu agar dibawa ke TPA berstandar.',
      '3. Hindari membakar styrofoam karena asapnya mengandung racun stirena dan karbon monoksida pekat.'
    ],
    recycling_potential: 'Sangat rendah karena 95% volumenya adalah udara, sehingga biaya angkut lebih mahal daripada nilai bahan daur ulangnya.',
    danger_notes: 'Bahan kimia karsinogenik stirena dapat bermigrasi ke makanan berlemak atau panas dan memicu risiko kanker serta gangguan hormon.',
    eco_tip: 'Hindari kemasan styrofoam! Bawalah kotak makan sendiri saat membeli makanan takeaway.'
  }
];

const VALID_CATEGORY_SLUGS = ['organik', 'anorganik', 'b3', 'residu', 'e-waste'];

// Helper to convert Image URL or Data URI to Base64 buffer
async function resolveImageBase64(image) {
  if (!image) return null;
  if (image.startsWith('data:image')) {
    const mimeType = image.split(';')[0].replace('data:', '') || 'image/jpeg';
    const base64Data = image.split(',')[1];
    return { mimeType, base64Data };
  }
  if (image.startsWith('http://') || image.startsWith('https://')) {
    try {
      const response = await fetch(image);
      const arrayBuffer = await response.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = response.headers.get('content-type') || 'image/jpeg';
      return { mimeType, base64Data };
    } catch (err) {
      console.warn('Gagal mengunduh remote image:', err.message);
    }
  }
  return null;
}

// Fallback keyword matcher (Hanya dipanggil bila ada hint/sampleId)
function matchWasteCategory(textHint = '') {
  const clean = String(textHint).toLowerCase().trim();
  if (!clean) return null;

  for (const item of KNOWLEDGE_BASE) {
    if (item.keywords.some(kw => clean.includes(kw))) {
      return item;
    }
  }

  const foundSeed = initialWasteItems.find(w => clean.includes(w.name.toLowerCase()));
  if (foundSeed) {
    return {
      name: foundSeed.name,
      category: 'Sampah Anorganik',
      category_slug: 'anorganik',
      bin_name: 'Tempat Sampah Anorganik',
      bin_color: '#2563EB',
      badge_bg: '#DBEAFE',
      badge_text: '#1D4ED8',
      is_recyclable: Boolean(foundSeed.is_recyclable),
      decomposition_time: foundSeed.decomposition_time || '100 Tahun',
      economic_value: 'Bernilai ekonomi di Bank Sampah',
      summary: foundSeed.summary,
      disposal_steps: safeParseJson(foundSeed.disposal_steps),
      recycling_potential: foundSeed.recycling_potential,
      danger_notes: foundSeed.danger_notes,
      eco_tip: 'Pilah sampah dari rumah untuk bumi yang lebih sehat!'
    };
  }

  return null;
}

// 1. Get Preset Samples
export async function getSamples(req, res) {
  return res.json({
    success: true,
    total: samplePresets.length,
    data: samplePresets
  });
}

// 2. Detect Waste using AI (Google Gemini Vision API + Strict Validation & Fallback)
export async function detectWaste(req, res) {
  try {
    const { image, hint, sampleId } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!image && !sampleId && !hint) {
      return res.status(400).json({
        success: false,
        message: 'Mohon sediakan foto sampah (kamera/unggah) atau pilih salah satu sampel.'
      });
    }

    // Check payload size if base64 image (limit to ~5MB binary / 7MB base64 string)
    if (image && typeof image === 'string' && image.length > 7 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        message: 'Ukuran foto terlalu besar. Maksimal ukuran gambar adalah 5 MB.'
      });
    }

    let detectionData = null;
    let confidence = null;
    let isAi = false;
    const detectedAt = new Date().toISOString();

    // Determine target image & hint
    let targetImage = image;
    let targetHint = (hint || '').trim();
    if (sampleId) {
      const preset = samplePresets.find(s => s.id === sampleId);
      if (preset) {
        if (!targetImage) targetImage = preset.thumbnail;
        if (!targetHint) targetHint = preset.hint;
      }
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    const model = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();

    // Attempt Gemini Vision AI if API Key is configured and an image is provided
    if (apiKey && targetImage) {
      const resolvedImage = await resolveImageBase64(targetImage);
      if (resolvedImage && resolvedImage.base64Data) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const prompt = `Kamu adalah 'Trashly Vision AI' untuk sistem edukasi pemilahan sampah Indonesia berstandar KLHK.
Analisis gambar ini dan kembalikan HANYA format JSON valid tanpa pembungkus markdown:
{
  "name": "nama jenis sampah spesifik (contoh: Botol Plastik PET)",
  "category": "Sampah Organik / Sampah Anorganik / Sampah B3 / Sampah Residu / E-Waste",
  "category_slug": "organik / anorganik / b3 / residu / e-waste",
  "confidence": angka persentase antara 90.0 sampai 99.8,
  "is_recyclable": true/false,
  "decomposition_time": "estimasi waktu urai alami (contoh: 450 Tahun)",
  "economic_value": "nilai jual di Bank Sampah (contoh: Rp 3.500 - Rp 5.000 / kg)",
  "summary": "penjelasan singkat material objek ini dan dampaknya",
  "disposal_steps": ["langkah pemilahan 1", "langkah pemilahan 2", "langkah pemilahan 3"],
  "recycling_potential": "potensi hasil daur ulang sirkular",
  "danger_notes": "bahaya jika dibakar atau dibuang sembarangan",
  "eco_tip": "tips ramah lingkungan untuk mengurangi sampah sejenis"
}`;

          const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inline_data: {
                        mime_type: resolvedImage.mimeType,
                        data: resolvedImage.base64Data
                      }
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.1,
                response_mime_type: "application/json"
              }
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (geminiRes.ok) {
            const geminiJson = await geminiRes.json();
            const rawText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              const parsed = JSON.parse(rawText);
              const slug = (parsed.category_slug || '').toLowerCase().trim();

              // Output validation: must have valid category_slug and disposal_steps array
              if (parsed.name && VALID_CATEGORY_SLUGS.includes(slug) && Array.isArray(parsed.disposal_steps)) {
                detectionData = {
                  ...parsed,
                  category_slug: slug,
                  bin_color: slug === 'organik' ? '#16A34A' : slug === 'b3' ? '#DC2626' : slug === 'e-waste' ? '#9333EA' : slug === 'residu' ? '#6B7280' : '#2563EB',
                  badge_bg: slug === 'organik' ? '#DCFCE7' : slug === 'b3' ? '#FEE2E2' : slug === 'e-waste' ? '#F3E8FF' : slug === 'residu' ? '#F3F4F6' : '#DBEAFE',
                  badge_text: slug === 'organik' ? '#15803D' : slug === 'b3' ? '#B91C1C' : slug === 'e-waste' ? '#7E22CE' : slug === 'residu' ? '#374151' : '#1D4ED8',
                  bin_name: parsed.bin_name || `Tempat Sampah ${parsed.category || 'Anorganik'}`
                };
                confidence = Number(parsed.confidence) || 95.0;
                isAi = true;
              }
            }
          }
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          console.warn('Gemini vision API error:', fetchErr.message);
        }
      }
    }

    // Fallback logic
    if (!detectionData) {
      // JANGAN menebak jika user mengirim foto tanpa hint/sampleId
      if (!targetHint && !sampleId) {
        return res.status(503).json({
          success: false,
          message: 'Layanan AI sedang tidak tersedia. Coba pilih sampel atau coba lagi nanti.'
        });
      }

      // Gunakan fallback keyword HANYA bila ada hint / sampleId valid
      const localMatch = matchWasteCategory(targetHint);
      if (!localMatch) {
        return res.status(503).json({
          success: false,
          message: 'Layanan AI sedang tidak tersedia. Coba pilih sampel atau coba lagi nanti.'
        });
      }

      detectionData = localMatch;
      confidence = null; // Tanpa angka buatan untuk mode lokal
      isAi = false;
    }

    // Award Eco-Points (+15 points) for authenticated user
    const pointsAwarded = 15;
    let newTotalPoints = null;

    if (userId) {
      if (isDbConnected()) {
        try {
          const pool = getPool();
          await pool.query('UPDATE users SET points = points + ? WHERE id = ?', [pointsAwarded, userId]);
          const [uRows] = await pool.query('SELECT points FROM users WHERE id = ?', [userId]);
          if (uRows.length > 0) newTotalPoints = uRows[0].points;

          await pool.query(
            `INSERT INTO waste_scans (user_id, waste_name, category_name, confidence, image_url, points_earned) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, detectionData.name, detectionData.category, confidence ? Math.round(confidence) : null, (targetImage && targetImage.length < 500000) ? targetImage : null, pointsAwarded]
          );
        } catch (dbErr) {
          console.warn('DB error saat menyimpan scan:', dbErr.message);
        }
      } else {
        const u = inMemoryStore.users.find(usr => String(usr.id) === String(userId) || (req.user?.email && usr.email === req.user.email));
        if (u) {
          u.points = (u.points || 0) + pointsAwarded;
          newTotalPoints = u.points;
        }
        inMemoryStore.scans.push({
          id: inMemoryStore.scans.length + 1,
          user_id: userId,
          waste_name: detectionData.name,
          category_name: detectionData.category,
          confidence: confidence ? Math.round(confidence) : null,
          image_url: (targetImage && targetImage.length < 500000) ? targetImage : null,
          points_earned: pointsAwarded,
          created_at: new Date()
        });
      }
    }

    const source = isAi ? 'ai' : 'local';

    const detectionPayload = {
      id: `scan-${Date.now()}`,
      name: detectionData.name,
      category: detectionData.category,
      category_slug: detectionData.category_slug,
      bin_name: detectionData.bin_name,
      bin_color: detectionData.bin_color,
      badge_bg: detectionData.badge_bg,
      badge_text: detectionData.badge_text,
      confidence: confidence,
      source: source,
      is_recyclable: detectionData.is_recyclable,
      decomposition_time: detectionData.decomposition_time,
      economic_value: detectionData.economic_value,
      summary: detectionData.summary,
      disposal_steps: detectionData.disposal_steps,
      recycling_potential: detectionData.recycling_potential,
      danger_notes: detectionData.danger_notes,
      eco_tip: detectionData.eco_tip,
      detected_at: detectedAt
    };

    return res.json({
      success: true,
      message: isAi 
        ? 'Objek sampah berhasil dianalisis oleh AI Trashly!' 
        : 'Identifikasi berdasarkan katalog sampel lokal.',
      detection: detectionPayload,
      data: detectionPayload,
      source: source,
      points_awarded: userId ? pointsAwarded : 0,
      new_total_points: newTotalPoints
    });

  } catch (error) {
    console.error('Error saat detectWaste:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memproses pemindaian sampah: ' + error.message
    });
  }
}

// 3. Get User Scan History
export async function getScanHistory(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    if (!userId) {
      return res.json({ success: true, total: 0, data: [] });
    }

    if (isDbConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query(
          'SELECT * FROM waste_scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 15',
          [userId]
        );
        return res.json({ success: true, total: rows.length, data: rows });
      } catch (dbErr) {
        console.warn('DB error di getScanHistory:', dbErr.message);
      }
    }

    const items = inMemoryStore.scans
      .filter(s => String(s.user_id) === String(userId))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 15);

    return res.json({ success: true, total: items.length, data: items });
  } catch (error) {
    console.error('Error saat getScanHistory:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil riwayat scan.' });
  }
}
